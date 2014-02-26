/**
	Main word game container.
	Holds dictionary of words and dynamically creates word ladder graphs when
	new games are loaded.
	
	Parameters:
		words - an array of all words that comprise the reference dictionary.
		timerCallback - callback function that executes every 1/10 second and accepts the time in seconds as a parameter.
*/
function WordGameController(words, timerCallback)
{
	var dict = loadDictionary(words);
	var graph = new Array();
	
	function makeGraph(wordList)
	{
		var graph = new Object();
		for(var y in wordList)
		{
			if(!graph[wordList[y]])
			{
				graph[wordList[y]] = new Array();
			}
			for(var x in graph)
			{
				if(checkAdjacent(x, wordList[y]))
				{
					graph[x].push(wordList[y]);
					graph[wordList[y]].push(x);
				}
			}
		}
		return graph;
	}
	/**
		Game object. Represents a single game session.
		Use WordGameController.startGame() to create a new game.
	*/
	function WordGame(length, start, end, dict, longest)
	{
		
		var ladder = [start];
		var timer = 0;
		var timerInterval;
		
		function keepTime()
		{
			timer += 1;
			if(typeof timerCallback == "function")
			{
				setTimeout(function(){timerCallback(timer / 10);}, 10);
			}
		}
		
		this.startTimer = function()
		{
			timerInterval = setInterval(keepTime, 100);
		};
		this.pauseTimer = function()
		{
			clearInterval(timerInterval);
		};
		function isWord(word)
		{
			return dict.indexOf(word.toLowerCase()) >= 0;
		}
		this.isWord = isWord;
		
		function verifyLadder()
		{
			for(var i = 0; i < ladder.length - 1; i++)
			{
				if(!checkAdjacent(ladder[i], ladder[i + 1]) || !isWord(ladder[i]))
				{
					return false;
				}
			}
			return isWord(ladder[ladder.length - 1]);
		}
		/**
			Attempts to add a word to the ladder.
			
			Returns:
				"ok" - if word is successfully added to ladder.
				"invalid" - if word is not one letter away from or is a different length than the previous word.
				"notfound" - if word is not found in dictionary.
				"duplicate" - if longest-ladder game is active and a duplicate word is entered.
				"win" - if word is successfully added and last word is reached.
				"error" - if user would win but the integrity check fails.
		*/
		this.addWord = function(newWord)
		{
			newWord = newWord.toLowerCase();
			if(longest && ladder.indexOf(newWord) >= 0)
			{
				return "duplicate";
			}
			var lastWord = ladder[ladder.length - 1];
			if(!checkAdjacent(newWord, lastWord))
			{
				return "invalid";
			}
			if(!isWord(newWord))
			{
				return "notfound";
			}
			ladder.push(newWord);
			if(newWord == end)
			{
				this.pauseTimer();
				if(verifyLadder())
				{
					return "win";
				}
				else
				{
					return "error";
				}
			}
			
			return "ok";
		}
		/**
			Removes the last word from the ladder, if any.
			
			Returns:
				"" - if there is only one word in the ladder.
				the last word in the ladder - if there is more than one word in the ladder.
		*/
		this.undo = function()
		{
			if(ladder.length <= 1)
			{
				return "";
			}
			return ladder.pop();
		}
		this.startTimer();
	}
	function loadDictionary(fulldict)
	{
		var result = new Array();
		for(var i in fulldict)
		{
			var word = fulldict[i];
			if(fulldict[i].length < 10)
			{
				if(!result[word.length])
				{
					result[word.length] = new Array();
				}
				result[word.length].push(word);
			}
		}
		return result;
	}
	
	function checkAdjacent(wordA, wordB)
	{
		var length = wordA.length;
		wordA = wordA.toLowerCase();
		wordB = wordB.toLowerCase();
		if(graph && graph[length] && graph[length][wordA] && graph[length][wordA].indexOf(wordB) >= 0)
		{
			return true;
		}
		var diff = 0;
		for(var i = 0; i < wordA.length; i++)
		{
			if(wordA[i] != wordB[i])
			{
				diff += 1;
			}
		}
		return diff == 1;
	}
	function isPossibleGame(wordA, wordB)
	{
		var length = wordA.length;
		if(wordA.length != wordB.length)
		{
			return false;
		}
		if(!graph)
		{
			graph = new Array();
		}
		if(!graph[length])
		{
			graph[length] = makeGraph(dict[length]);
		}
		wordA = wordA.toLowerCase();
		wordB = wordB.toLowerCase();
		var checked = new Array();
		checked.push(wordA);
		for(var y = 0; y < checked.length; y++)
		{
			for(var x in graph[length][checked[y]])
			{
				var nextWord = graph[length][checked[y]][x];
				if(nextWord == wordB)
				{
					return true;
				}
				if(checked.indexOf(nextWord) < 0)
				{
					checked.push(nextWord);
				}
			}
		}
		return false;
	}
	/**
		Starts a new game session.
		
		Parameters:
			start - first word in the word ladder
			end - target word
			longest - true for longest-ladder game, false for normal game
		
		Returns:
			a new WordGame object
			
	*/
	this.startGame = function(start, end, longest)
	{
		start = start.toLowerCase();
		end = end.toLowerCase();
		if(!isPossibleGame(start, end))
		{
			return false;
		}
		return new WordGame(start.length, start, end, dict[start.length], longest);
	};
	this.graph = graph;
}

