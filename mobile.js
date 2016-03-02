var game = new Phaser.Game(700, 700, Phaser.AUTO, null, {preload: preload, create: create, update: update});

var asteroid;
var trampoline;
var ships;
var newBrick;
var shipInfo;
var scoreText;
var score = 0;
var lives = 3;
var shipsLeft = 24;
var shipsLeftText;
var livesText;
var lifeLostText;
var playing = false;
var startButton;
var space;
var startText;
var killed = 0;
var lastScore = localStorage.getItem("score");


function preload() {
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.load.image('trampoline', 'assets/tramp.png');
    game.load.image('ship', 'assets/ship.png');
    game.load.image('asteroid', 'assets/asteroid.png');
    game.load.image('button', 'assets/tramp.png');
    game.load.image('space', 'assets/space.png');
    this.game.add.text(0, 0, "fix", {font:"1px Orbitron", fill:"#FFFFFF"});

}

function create() {
    space = game.add.tileSprite(0, 0, 700, 700, 'space');
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.physics.arcade.checkCollision.down = false;

    asteroid = game.add.sprite(350, 490, 'asteroid');
    asteroid.anchor.set(0.5);
    game.physics.enable(asteroid, Phaser.Physics.ARCADE);
    asteroid.body.collideWorldBounds = true;
    asteroid.body.bounce.set(1);
    asteroid.checkWorldBounds = true;
    asteroid.events.onOutOfBounds.add(ballLeaveScreen, this);

    trampoline = game.add.sprite(350, 640, 'trampoline');
    game.physics.enable(trampoline, Phaser.Physics.ARCADE);
    trampoline.anchor.set(0.5,0.5)
    trampoline.body.immovable = true;

    createShips();

    startText = game.add.text(350, 350, 'Touch and hold the trampoline!', {font: '20px Orbitron', fill: 'limegreen'});
    startText.anchor.set(0.5);
    startText.visible = true;

    shipsLeftText = game.add.text(280, 5, 'Enemies left: '+shipsLeft, {font: '20px Orbitron', fill: 'limegreen'});
    shipsLeftText.visible = true;
    scoreText = game.add.text(5, 5, 'Score: 0', { font: '20px Orbitron', fill: 'limegreen'});
    scoreText.visible = true;

    livesText = game.add.text(game.world.width-5, 5, 'Lives: '+lives, { font: '20px Orbitron', fill: 'limegreen' });
    livesText.anchor.set(1,0);
    livesText.visible = true;

    lifeLostText = game.add.text(350, 350, 'Life lost! Click to start again.', { font: '20px Orbitron', fill: 'limegreen' });
    lifeLostText.anchor.set(0.5);
    lifeLostText.visible = false;

    startButton = game.add.button(350, 640, 'button', startGame, this, 1, 0, 2);
    startButton.anchor.set(0.5);

}
function update() {
  space.tilePosition.y += 2;
    game.physics.arcade.collide(asteroid, trampoline, ballHitPaddle);
    game.physics.arcade.collide(asteroid, ships, ballHitBrick);
    if(playing) {
        game.physics.arcade.moveToPointer(trampoline, 60, game.input.activePointer, 150);
    }
}

function createShips() {
    shipInfo = {
        width: 70,
        height: 30,
        count: {
            row: 8,
            col: 3
        },
        offset: {
            top: 50,
            left: 60
        },
        padding: 10
    }
    ships = game.add.group();
    for(c=0; c<shipInfo.count.col; c++) {
        for(r=0; r<shipInfo.count.row; r++) {
            var shipX = (r*(shipInfo.width+shipInfo.padding))+shipInfo.offset.left;
            var shipY = (c*(shipInfo.height+shipInfo.padding))+shipInfo.offset.top;
            newBrick = game.add.sprite(shipX, shipY, 'ship');
            game.physics.enable(newBrick, Phaser.Physics.ARCADE);
            newBrick.body.immovable = true;
            newBrick.anchor.set(0.5);
            ships.add(newBrick);
        }
    }
}
function ballHitBrick(asteroid, ship) {
    shipsLeft -= 1;
    score += 100;
    scoreText.setText('Score: '+score);
    shipsLeftText.setText('Enemies left: '+shipsLeft);
    // $('#scoreVal').text(score);
    killed += 1;
    // $('#numKilled').text(shipsLeft);
    if(shipsLeft === 0){
      alert('Hey! You won! You scored: '+score+'. \n The last score was: '+lastScore)
      localStorage.setItem("score", score);
      alert('this is a test')
      location.reload();
    }
    var killTween = game.add.tween(ship.scale);
    killTween.to({x:0,y:0}, 120, Phaser.Easing.Linear.None);
    killTween.onComplete.addOnce(function(){
      ship.kill();
    }, this);
    killTween.start();
}
function ballLeaveScreen() {
    lives--;
    // $('#livesLeft').text(lives);
    if(lives) {
        livesText.setText('Lives: '+lives);
        lifeLostText.visible = true;
        asteroid.reset(350, 490);
        trampoline.reset(350, 655);
        playing = false;
        game.input.onDown.addOnce(function(){
            lifeLostText.visible = false;
            playing = true;
        }, this);
    }
    else {
        localStorage.setItem("score", score);
        alert('You lost, game over! You scored: '+score+'. \n The last score was: '+lastScore+'.')
        location.reload();
    }
}
function ballHitPaddle(asteroid, trampoline) {
    asteroid.body.velocity.x = -1*5*(trampoline.x-asteroid.x);
}
function startGame() {
  startButton.destroy();
    startText.alpha = 0;
    playing = true;
}
