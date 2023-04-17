export default function randomSentence() {
	const sentence = new Array();
	sentence.push("It may be a den of thieves!");
	sentence.push("Maybe it's a scientologist hangout!");
	sentence.push("Maybe it's only for Quebec lumberjacks!");
	//TODO
	//MORE!!
	return sentence.at(Math.floor(Math.random() * sentence.length));
}
