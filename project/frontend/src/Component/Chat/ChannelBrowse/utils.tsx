export default function randomSentence() {
	const sentence = new Array();
	sentence.push("It may be a den of thieves!");
	sentence.push("Maybe it's a scientologist hangout!");
	sentence.push("Maybe it's only for Quebec lumberjacks!");
	sentence.push("It might be a gathering place for time travelers!");
	sentence.push("Maybe it's a clubhouse for retired circus performers!");
	sentence.push("Perhaps it's a hideout for super villains!");
	sentence.push("Maybe it's a secret lair for mad scientists!");
	sentence.push("It could be a training ground for ninja assassins!");
	sentence.push("Maybe it's a temple of the ancient order of mystics!");
	sentence.push("Perhaps it's a safe haven for persecuted unicorns!");
	sentence.push("It could be a refuge for intergalactic refugees!");
	sentence.push("Maybe it's a laboratory for genetically engineered monsters!");
	sentence.push("Perhaps it's a museum of lost civilizations!");
	sentence.push("It could be a front for a money laundering operation!");
	sentence.push("Perhaps it's a secret society meeting place!");

	return sentence.at(Math.floor(Math.random() * sentence.length));
}
