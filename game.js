var config = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    parent: game,
    playerSpeed: 400,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 250 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};
var player;
var resetButton;
var stars;
var bombs;
var platforms;
var enemyCount = 2;
var cursors;
var enemy ;
var score = 0;
var life = 3
var gameOver = false;
var scoreText;
var enemyText;
var lifesText;
var game = new Phaser.Game(config);
var worldWidth = config.width * 2;

function preload() {

    this.load.image('fon', 'assets/fon.jpg');
    this.load.image('heart', 'assets/life.png');
    this.load.image('resetButton', 'assets/R.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('Stone', 'assets/Stone.png');
    this.load.image('enemy', 'assets/enemy.png');
    this.load.image('star', 'assets/star.png');
    //повітряні платформи
    this.load.image('13', 'assets/13.png');
    this.load.image('14', 'assets/14.png');
    this.load.image('15', 'assets/15.png');

    //ground
    this.load.image('1', 'assets/1.png');
    this.load.image('2', 'assets/2.png');
    this.load.image('3', 'assets/3.png');

    this.load.image('17', 'assets/17.png');


    this.load.image('bomb', 'assets/bomb.png');
    this.load.image('tree', 'assets/Tree_1.png');
    this.load.spritesheet('dude',
        'assets/dude.png',
        { frameWidth: 32, frameHeight: 48 }
    );
}

function create() {
    //фон
    this.add.tileSprite(0, 0, worldWidth, 1080, "fon")
        .setOrigin(0, 0)
        .setScale(1)
        .setDepth(0);

    this.add.tileSprite(0, 1000, worldWidth, 1080, "17")
        .setOrigin(0, 0)
        .setScale(1)
        .setDepth(0);



    //повітряні платформи
    platforms = this.physics.add.staticGroup();
    for (var x = 0; x < worldWidth; x = x + Phaser.Math.Between(200, 300)) {
        var yStep = Phaser.Math.Between(1, 4);
        var y = 210 * yStep
        platforms.create(x, y, '13');
        var i;
        for (i = 1; i < Phaser.Math.Between(0, 5); i++) {
            platforms.create(x + 128 * i, y, '14');
        }
        platforms.create(x + 128 * i, y, '15');


    }
    //платформи на землі
    for (var x = 0; x < worldWidth; x = x + Phaser.Math.Between(100, 400)) {

        var y = 1020
        platforms.create(x, y, '1');
        var i;
        for (i = 1; i < Phaser.Math.Between(0, 5); i++) {
            platforms.create(x + 128 * i, y, '2');
        }
        platforms.create(x + 128 * i, y, '3');


    }


    //камінці і дерева
    stone = this.physics.add.staticGroup();
    for (var x = 0; x < worldWidth; x = x + Phaser.Math.FloatBetween(400, 500)) {
        var y = 960;
        console.log(x, y);
        stone.create(x, y, 'Stone').setOrigin(0, 1).setScale(Phaser.Math.FloatBetween(1, 2));
    }

    trees = this.physics.add.staticGroup();
    for (var x = 0; x < worldWidth; x = x + Phaser.Math.FloatBetween(400, 500)) {
        var y = 960;
        console.log(x, y);
        trees.create(x, y, 'tree').setOrigin(0, 1).setScale(Phaser.Math.FloatBetween(1, 2));
    }

    player = this.physics.add.sprite(0, 0, 'dude').setDepth(2);
    player.setBounce(0.2);
    player.setCollideWorldBounds(false);
    //кнопка перезапуску
    resetButton = this.add.image(900, 500, 'resetButton')
    resetButton.setOrigin(0, 0)
        .setDepth(10)
        .setScrollFactor(0)
        .setInteractive()
        .on('pointerdown', function () {
            // Перезавантаження гри
            location.reload();
        });

    resetButton.setVisible(false);
    //камера
    this.cameras.main.setBounds(0, 0, worldWidth, 1080);
    this.physics.world.setBounds(0, 0, worldWidth, 1080);

    this.cameras.main.startFollow(player);





    //анімація персонажа
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [{ key: 'dude', frame: 4 }],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });


    cursors = this.input.keyboard.createCursorKeys();
    //зірки
    stars = this.physics.add.group({
        key: 'star',
        repeat: 111,
        setXY: { x: 12, y: 0, stepX: 90 }
    });

    stars.children.iterate(function (child) {

        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

    });
    //бомби
    bombs = this.physics.add.group();
    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' })

    .setScrollFactor(0)
    .setOrigin(0,0);
    enemyText = this.add.text(0 , 50 , showTextSymbols('👾' , enemyCount), { fontSize: '32px', fill: '#000' })

    .setOrigin(0,0)
    .setScrollFactor(0);

    lifeText = this.add.text(1700, 16, showLife(), { fontSize: '32px', fill: '#ffffff' })
    .setOrigin(0, 0)
    .setScrollFactor(0);
     heart = this.physics.add.group({
        key: 'heart',
        repeat: 10,
        setXY: { x: 12, y: 0, stepX: Phaser.Math.FloatBetween(1000, 2500) }
    }); 
    heart.children.iterate(function(child) {
        child.setScale(0.07);
    });

    heart.children.iterate(function (child) {

        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

    });

    enemy = this.physics.add.group({
     key:'enemy' ,
     repeat: enemyCount ,
     setXY: {x: 1000 , y: 1080 - 150 , stepX: Phaser.Math.FloatBetween(300,500) }



    });

    enemy.children.iterate(function(child) {
    child
    .setCollideWorldBounds(true)
    .setVelocityX(Phaser.Math.FloatBetween(-500 , 500));



    });

    

        
    


    //колізії
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(heart, platforms);
    this.physics.add.collider(stars, platforms);
    this.physics.add.collider(bombs, platforms);
    this.physics.add.overlap(player, heart, collectHeart, null, this);
    
    this.physics.add.overlap(player, stars, collectStar, null, this);
    this.physics.add.collider(player, bombs, hitBomb, null, this);

    this.physics.add.collider(enemy, platforms);
    this.physics.add.collider(player, enemy, () => {
     player.x = player.x + Phaser.Math.FloatBetween(-200 , 200);
     player.y = player.y + Phaser.Math.FloatBetween(200 , 400);
    }, null ,this);
}

function update() {
    if (Math.abs (player.x - enemy.x) < 600 ) {
     enemy.moveTo(player,player.x,player.y, 300,1)
    }
     enemy.children.iterate((child) => {
      if(Math.random()<0.05){
        child.setVelocityX(Phaser.Math.FloatBetween(-500,500))
      }



     })
    
    
    if (gameOver) {
        gameOver = true;
        this.physics.pause();
        player.setTint(0xff0000);
        player.anims.play('turn');
    }
    if (player.y >= 1080) {
        resetButton.setVisible(true);
        gameOver = true;
        this.physics.pause();
        player.setTint(0xff0000);
        player.anims.play('turn');

    }
    if (player.x >= 2000 * 2) {
        resetButton.setVisible(true);
        gameOver = true;
        this.physics.pause();
        player.setTint(0xff0000);
        player.anims.play('turn');

    }
    if (player.x <= -50) {
        resetButton.setVisible(true);
        gameOver = true;
        this.physics.pause();
        player.setTint(0xff0000);
        player.anims.play('turn');

    }
    if (cursors.left.isDown) {
        player.setVelocityX(-config.playerSpeed);

        player.anims.play('left', true);
    }
    else if (cursors.right.isDown) {
        player.setVelocityX(config.playerSpeed);

        player.anims.play('right', true);
    }
    else {
        player.setVelocityX(0);

        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-480);
    }

}
//збирання зірок
function collectStar(player, star) {
    star.disableBody(true, true);
    score += 10;
    scoreText.setText('Score: ' + score);


    var x = Phaser.Math.Between(0, worldWidth);
    var y = Phaser.Math.Between(0, config.height);
    var bomb = bombs.create(x, 0, 'bomb');
    bomb.setScale(0.25);
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);

    if (stars.countActive(true) === 0) {

        stars.children.iterate(function (child) {
            child.enableBody(true, child.x, 0, true, true);
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        });
    }
}
var isHitByBomb = false;
//колізія з бомбами і сердчека
function hitBomb(player, bomb) {
    if (isHitByBomb) {
        return;
    }
    isHitByBomb = true;

    life = life - 1;
    lifeText.setText( showLife());
    var direction = (bomb.x < player.x) ? 1 : -1;
    bomb.setVelocityX(300 * direction);
    player.setTint(0xff0000);
    this.time.addEvent({
        delay: 1000,
        callback: function () {
            player.clearTint();
            isHitByBomb = false;
        },
        callbackScope: this,
        loop: false
    });
    //закінчення гри при кількості життів = 0 
    if (life === 0) {
        resetButton.setVisible(true);
        gameOver = true;
        this.physics.pause();
        player.setTint(0xff0000);
        player.anims.play('turn');
    }
}
// функції сердечки
function showLife() {
    var lifeLine = ''
    for (var i = 0; i < life; i++) {
        lifeLine = lifeLine + '❤'
    }
    return lifeLine
}

function collectHeart(player, heart) {
    heart.disableBody(true, true);

    life += 1;

    lifeText.setText(showLife());

    console.log(life)
}
function showTextSymbols(symbol , count ) {
var symbolLine = ''

for ( var i = 0; i < count; i++){
symbolLine = symbolLine + symbol

}
return symbolLine
}

