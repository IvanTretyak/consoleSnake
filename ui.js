"use strict";
const React = require("react");
const { useState, useEffect } = require("react");
const { Text, Box, useStdin } = require("ink");
const useInterval = require("./useInterval");
const importJsx = require("import-jsx");
const EndScreen = importJsx("./EndScreen");

const ARROW_UP = "\u001B[A";
const ARROW_DOWN = "\u001B[B";
const ARROW_LEFT = "\u001B[D";
const ARROW_RIGHT = "\u001B[C";

const FIELD_SIZE = 16;
const FIELD_ROW = [...new Array(FIELD_SIZE).keys()];
let foodItem = {
	x: Math.floor(Math.random() * FIELD_SIZE),
	y: Math.floor(Math.random() * FIELD_SIZE),
};
const DIRECTION = {
	LEFT: { x: -1, y: 0 },
	RIGHT: { x: 1, y: 0 },
	TOP: { x: 0, y: -1 },
	DOWN: { x: 0, y: 1 },
};
function getItem(x, y, snakeSegments) {
	if (foodItem.x === x && foodItem.y === y) {
		return <Text color="red"> o </Text>;
	}
	for (let segment of snakeSegments) {
		if (segment.x === x && segment.y === y) {
			return <Text color="green"> x </Text>;
		}
	}
}
function limitByField(coordinate) {
	if (coordinate >= FIELD_SIZE) {
		return 0;
	}
	if (coordinate < 0) {
		return FIELD_SIZE - 1;
	}
	return coordinate;
}
function newSnakePosition(segments, direction) {
	const [head] = segments;
	const newHead = {
		x: limitByField(head.x + direction.x),
		y: limitByField(head.y + direction.y),
	};
	if (collideWithFood(newHead, foodItem)) {
		foodItem = {
			x: Math.floor(Math.random() * FIELD_SIZE),
			y: Math.floor(Math.random() * FIELD_SIZE),
		};
		return [newHead, ...segments];
	}
	return [newHead, ...segments.slice(0, -1)];
}
function collideWithFood(head, foodItem) {
	return head.x === foodItem.x && head.y === foodItem.y;
}
const App = () => {
	const [snakeSegments, setSnakeSegments] = useState([
		{ x: 8, y: 8 },
		{ x: 8, y: 7 },
		{ x: 8, y: 6 },
	]);
	const [direction, setDirection] = useState(DIRECTION.LEFT);
	const { stdin, setRawMode } = useStdin();
	const [head, ...tail] = snakeSegments;
	const crossItSelf = tail.some((segment) => {
		segment.x === head.x && segment.y === head.y;
	});

	useInterval(
		() => {
			setSnakeSegments(newSnakePosition(snakeSegments, direction));
		},
		crossItSelf ? null : 200
	);

	useEffect(() => {
		setRawMode(true);
		stdin.on("data", (data) => {
			const value = data.toString();
			if (value === ARROW_UP) {
				setDirection(DIRECTION.TOP);
			}
			if (value === ARROW_DOWN) {
				setDirection(DIRECTION.DOWN);
			}
			if (value === ARROW_LEFT) {
				setDirection(DIRECTION.LEFT);
			}
			if (value === ARROW_RIGHT) {
				setDirection(DIRECTION.RIGHT);
			}
		});
	});

	return (
		<Box flexDirection="column" alignItems="center">
			<Text>Snake game</Text>
			{crossItSelf ? (
				<EndScreen size={FIELD_SIZE} />
			) : (
				<Box flexDirection="column">
					{FIELD_ROW.map((y) => (
						<Box key={y}>
							{FIELD_ROW.map((x) => (
								<Box key={x}>
									<Text>{getItem(x, y, snakeSegments) || " . "} </Text>
								</Box>
							))}
						</Box>
					))}
				</Box>
			)}
		</Box>
	);
};

module.exports = App;
