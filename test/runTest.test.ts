import { expect } from "chai";
import { ethers } from "hardhat";
import { SimpleCardGame } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("SimpleCardGame", function () {
  let cardGame: SimpleCardGame;
  let owner: SignerWithAddress;
  let player1: SignerWithAddress;
  let player2: SignerWithAddress;

  beforeEach(async function () {
    [owner, player1, player2] = await ethers.getSigners();

    const CardGameFactory = await ethers.getContractFactory("SimpleCardGame");
    cardGame = await CardGameFactory.deploy();
    await cardGame.deployed();
  });

  describe("startGame", function () {
      it("Should revert if no players are provided", async function () {
        await expect(cardGame.startGame([])).to.be.revertedWith(
            "At least one player is needed to start the game."
        );
      });

      it("Should deal cards to all players", async function () {
          await cardGame.startGame([player1.address, player2.address]);

          const player1Hand = await cardGame.getPlayerHand(player1.address);
          const player2Hand = await cardGame.getPlayerHand(player2.address);

        expect(player1Hand.length).to.equal(3);
        expect(player2Hand.length).to.equal(3);
      });

      it("Should revert if cards are already dealt", async function() {
          await cardGame.startGame([player1.address]);
          await expect(cardGame.startGame([player1.address])).to.be.revertedWith(
              "Cards have already been dealt to this player."
          );
      })
    });

  describe("_dealCards", function () {
    it("Should deal 3 unique cards to a player", async function () {
      await cardGame.startGame([player1.address]);
      const hand = await cardGame.getPlayerHand(player1.address);
        expect(hand.length).to.equal(3);
    });

    it("Should emit CardDrawn event for each card dealt", async function() {
        await cardGame.startGame([player1.address]);

        const tx = await cardGame.startGame([player1.address]);
        const receipt = await tx.wait();
        const cardDrawnEvents = receipt.events?.filter((event) => event.event === "CardDrawn") || [];
        expect(cardDrawnEvents.length).to.equal(3);
        cardDrawnEvents.forEach((event) => {
          expect(event.args?.player).to.equal(player1.address);
          expect(event.args?.cardValue).to.be.a('number');
        });
    });

      it("Should not deal cards if they have been dealt before", async function () {
        await cardGame.startGame([player1.address]);
        await expect(cardGame.startGame([player1.address])).to.be.revertedWith("Cards have already been dealt to this player.");
      });
  });

  describe("_generateRandomNumber", function () {
        it("Should generate a number within the correct range", async function () {
            const generatedNumber = await cardGame.connect(player1)._generateRandomNumber(player1.address, 1);
            expect(generatedNumber).to.be.gte(1);
            expect(generatedNumber).to.be.lte(10);

            const generatedNumber2 = await cardGame.connect(player2)._generateRandomNumber(player2.address, 2);
            expect(generatedNumber2).to.be.gte(1);
            expect(generatedNumber2).to.be.lte(10);

            const generatedNumber3 = await cardGame.connect(player1)._generateRandomNumber(player1.address, 3);
            expect(generatedNumber3).to.be.gte(1);
            expect(generatedNumber3).to.be.lte(10);

        });

        it("Should generate different numbers with different seeds", async function() {
            const generatedNumber1 = await cardGame.connect(player1)._generateRandomNumber(player1.address, 1);
            const generatedNumber2 = await cardGame.connect(player1)._generateRandomNumber(player1.address, 2);
            expect(generatedNumber1).to.not.equal(generatedNumber2);
        });

    it("Should generate different numbers for different players", async function() {
            const generatedNumber1 = await cardGame.connect(player1)._generateRandomNumber(player1.address, 1);
            const generatedNumber2 = await cardGame.connect(player2)._generateRandomNumber(player2.address, 1);
            expect(generatedNumber1).to.not.equal(generatedNumber2);
        });
    });


  describe("checkMatches", function () {
        it("Should revert if the player has already checked matches", async function () {
            await cardGame.startGame([player1.address]);
            await cardGame.connect(player1).checkMatches();
            await expect(cardGame.connect(player1).checkMatches()).to.be.revertedWith("You have already checked matches.");
        });

      it("Should revert if player has no cards dealt", async function() {
          await expect(cardGame.connect(player1).checkMatches()).to.be.revertedWith(
              "You have not drawn cards yet."
          );
      });


      it("Should calculate matches correctly with no matches", async function () {
          await cardGame.startGame([player1.address]);
          await cardGame.connect(player1).checkMatches();
            const matches = await cardGame.getPlayerMatches(player1.address);
            expect(matches).to.equal(0);
      });

      it("Should calculate matches correctly with 1 match", async function () {
          const mockCardGame = await (await ethers.getContractFactory("SimpleCardGame")).deploy();
          await mockCardGame.deployed();
          mockCardGame.playerHands[player1.address] = [1, 1, 2];
          await mockCardGame.connect(player1).checkMatches();
            const matches = await mockCardGame.getPlayerMatches(player1.address);
            expect(matches).to.equal(1);
      });


      it("Should calculate matches correctly with 2 matches", async function () {
          const mockCardGame = await (await ethers.getContractFactory("SimpleCardGame")).deploy();
          await mockCardGame.deployed();
          mockCardGame.playerHands[player1.address] = [1, 1, 1];
          await mockCardGame.connect(player1).checkMatches();
          const matches = await mockCardGame.getPlayerMatches(player1.address);
          expect(matches).to.equal(3);
      });


      it("Should emit MatchFound event with the correct number of matches", async function() {
          const mockCardGame = await (await ethers.getContractFactory("SimpleCardGame")).deploy();
          await mockCardGame.deployed();
          mockCardGame.playerHands[player1.address] = [1,1,2];
          const tx = await mockCardGame.connect(player1).checkMatches();
          const receipt = await tx.wait();
          const matchFoundEvent = receipt.events?.find((event) => event.event === "MatchFound");
          expect(matchFoundEvent).to.not.be.undefined;
          expect(matchFoundEvent?.args?.player).to.equal(player1.address);
          expect(matchFoundEvent?.args?.numberOfMatches).to.equal(1);

      });
  });

  describe("_checkWinCondition", function () {

    it("Should emit GameWon event if matches are equal or greater than winning matches", async function() {
      const mockCardGame = await (await ethers.getContractFactory("SimpleCardGame")).deploy();
        await mockCardGame.deployed();
        mockCardGame.playerHands[player1.address] = [1,1,1];
        const tx = await mockCardGame.connect(player1).checkMatches();
        const receipt = await tx.wait();
        const gameWonEvent = receipt.events?.find((event) => event.event === "GameWon");
        expect(gameWonEvent).to.not.be.undefined;
        expect(gameWonEvent?.args?.winner).to.equal(player1.address);
    });

      it("Should not emit GameWon event if matches are less than winning matches", async function () {
          const mockCardGame = await (await ethers.getContractFactory("SimpleCardGame")).deploy();
          await mockCardGame.deployed();
          mockCardGame.playerHands[player1.address] = [1,1,2];
          const tx = await mockCardGame.connect(player1).checkMatches();
          const receipt = await tx.wait();
          const gameWonEvent = receipt.events?.find((event) => event.event === "GameWon");
          expect(gameWonEvent).to.be.undefined;

      });
  });


    describe("getPlayerHand", function () {
        it("Should return the player's hand", async function () {
            await cardGame.startGame([player1.address]);
            const hand = await cardGame.getPlayerHand(player1.address);
            expect(hand.length).to.equal(3);
        });

        it("Should return an empty array if no cards have been dealt", async function () {
            const hand = await cardGame.getPlayerHand(player1.address);
            expect(hand.length).to.equal(0);
        });
    });

    describe("getPlayerMatches", function () {
        it("Should return the correct number of matches for a player", async function () {
            const mockCardGame = await (await ethers.getContractFactory("SimpleCardGame")).deploy();
            await mockCardGame.deployed();
            mockCardGame.playerHands[player1.address] = [1, 1, 2];
            await mockCardGame.connect(player1).checkMatches();
            const matches = await mockCardGame.getPlayerMatches(player1.address);
            expect(matches).to.equal(1);

            mockCardGame.playerHands[player2.address] = [1, 2, 3];
            await mockCardGame.connect(player2).checkMatches();
            const matches2 = await mockCardGame.getPlayerMatches(player2.address);
             expect(matches2).to.equal(0);
        });

    });

  describe("Gas Efficiency", function () {
    it("Check match function", async function () {
        await cardGame.startGame([player1.address]);
      const tx = await cardGame.connect(player1).checkMatches();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed;
      console.log(`Gas Used for checkMatches: ${gasUsed}`);
      expect(gasUsed).to.be.a("number");
    });

    it("Start game function", async function () {
        const tx = await cardGame.startGame([player1.address, player2.address]);
        const receipt = await tx.wait();
        const gasUsed = receipt.gasUsed;
        console.log(`Gas Used for startGame: ${gasUsed}`);
        expect(gasUsed).to.be.a("number");
    })

    });
});