import { useEffect, useState } from 'react';
import Web3 from 'web3';
import './App.css';

import bgImage from './images/bg1.jpg';
const abi = [
  {
    inputs: [],
    name: 'deposit',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'Deposit',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'gameId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'player',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'betAmount',
        type: 'uint256',
      },
    ],
    name: 'GameCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'gameId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'player',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'reward',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'result',
        type: 'string',
      },
    ],
    name: 'GameFinished',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'enum RockPaperScissors.Choice',
        name: '_playerChoice',
        type: 'uint8',
      },
    ],
    name: 'play',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256',
      },
    ],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'receiver',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'Withdrawal',
    type: 'event',
  },
  {
    inputs: [],
    name: 'gameId',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'games',
    outputs: [
      {
        internalType: 'address payable',
        name: 'player',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'betAmount',
        type: 'uint256',
      },
      {
        internalType: 'enum RockPaperScissors.Choice',
        name: 'playerChoice',
        type: 'uint8',
      },
      {
        internalType: 'enum RockPaperScissors.Choice',
        name: 'dealerChoice',
        type: 'uint8',
      },
      {
        internalType: 'bool',
        name: 'isFinished',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];

const App = () => {
  const [buttonDisabled, setDisable] = useState(false);
  const [userChoice, setUserChoice] = useState('rock');
  const [computerChoice, setComputerChoice] = useState('rock');
  const [userPoints, setUserPoints] = useState(0);
  const [computerPoints, setComputerPoints] = useState(0);
  const [turnResult, setTurnResult] = useState(null);
  const [result, setResult] = useState("Let's see who wins");
  const [gameOver, setGameOver] = useState(false);
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const choices = ['rock', 'paper', 'scissors'];

  useEffect(() => {
    const init = async () => {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);

      const accounts = await web3Instance.eth.requestAccounts();
      setAccount(accounts[0]);

      const contractAddress = '0xC666Eb490BC3697d441eea36f6e4D1C032c94203';
      const contractInstance = new web3Instance.eth.Contract(
        abi,
        contractAddress
      );
      setContract(contractInstance);
    };

    init();
  }, []);

  const handleClick = async (value) => {
    setUserChoice(value);
    await playGame(value);
  };

  const playGame = async (playerChoice) => {
    try {
      const choiceIndex = choices.indexOf(playerChoice);
      const transaction = await contract.methods.play(choiceIndex).send({
        from: account,
        value: web3.utils.toWei('0.0001', 'ether'),
      });

      const gameId = await contract.methods.gameId().call();
      const gameData = await contract.methods.games(gameId).call();
      updateGameResult(gameData);
    } catch (error) {
      console.error('Error playing game:', error);
      alert('An error occurred: ' + error.message);
    }
  };

  const updateGameResult = (gameData) => {
    const dealerChoice = choices[gameData.dealerChoice];
    setComputerChoice(dealerChoice);

    const playerChoice = gameData.playerChoice;
    const dealerChoiceValue = gameData.dealerChoice;

    if (playerChoice === dealerChoiceValue) {
      setTurnResult("It's a tie!");
    } else if (
      (playerChoice == 0n && dealerChoiceValue == 2n) ||
      (playerChoice == 1n && dealerChoiceValue == 0n) ||
      (playerChoice == 2n && dealerChoiceValue == 1n)
    ) {
      setTurnResult('You win this round!');
      setUserPoints((prev) => prev + 1);
    } else {
      setTurnResult('You lose this round!');
      setComputerPoints((prev) => prev + 1);
    }

    if (userPoints + computerPoints === 3) {
      setGameOver(true);
      setResult(
        userPoints === 2
          ? 'Congratulations! You won the game!'
          : 'Game over! Computer won.'
      );
    }
  };
  useEffect(() => {
    if (userPoints === 2) {
      setGameOver(true);
      setResult('Congratulations! You won the game!');
      setDisable(true);
    } else if (computerPoints === 2) {
      setGameOver(true);
      setResult('Game over! Computer won.');
      setDisable(true);
    }
  }, [userPoints, computerPoints]);

  const reset = () => {
    setDisable(false);
    setUserChoice('rock');
    setComputerChoice('rock');
    setUserPoints(0);
    setComputerPoints(0);
    setTurnResult(null);
    setResult("Let's see who wins");
    setGameOver(false);
  };

  return (
    <div
      className="App"
      style={{
        backgroundImage: `url(${bgImage})`,
      }}
    >
      <h1 className="heading">Rock-Paper-Scissors</h1>
      <div className="score">
        <h1>User Points: {userPoints}</h1>
        <h1>Computer Points: {computerPoints}</h1>
      </div>

      <div className="choice">
        <div className="choice-user">
          <img
            className="user-hand"
            src={`../images/${userChoice}.png`}
            alt="User choice"
          />
        </div>
        <div className="choice-computer">
          <img
            className="computer-hand"
            src={`../images/${computerChoice}.png`}
            alt="Computer choice"
          />
        </div>
      </div>

      <div className="buttons">
        {choices.map((choice) => (
          <button
            key={choice}
            onClick={() => handleClick(choice)}
            disabled={buttonDisabled}
          >
            {choice.charAt(0).toUpperCase() + choice.slice(1)}
          </button>
        ))}
      </div>

      <div className="result">
        <h1>{turnResult}</h1>
        <h2>{result}</h2>
      </div>

      {gameOver && (
        <button
          className="reset"
          onClick={reset}
        >
          Reset Game
        </button>
      )}
    </div>
  );
};

export default App;
