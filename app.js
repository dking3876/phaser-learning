var GameScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function GameScene ()
    {
        Phaser.Scene.call(this, { key: 'gameScene', active: true });

        this.player = null;
        this.cursors = null;
        this.score = 0;
        this.scoreText = null;
        this.starCount = 0;
        this.platforms = null;
        this.player = null;
        this.star = null;
        this.totalStars = 0;
    },

    preload: function ()
    {
        this.load.setBaseURL('http://labs.phaser.io');
        this.load.image('sky', 'src/games/firstgame/assets/sky.png');
        this.load.image('ground', 'src/games/firstgame/assets/platform.png');
        this.load.image('star', 'src/games/firstgame/assets/star.png');
        this.load.image('bomb', 'src/games/firstgame/assets/bomb.png');
        this.load.spritesheet('dude', 'src/games/firstgame/assets/dude.png', { frameWidth: 32, frameHeight: 48 });
        this.load.spritesheet('fullscreen', 'assets/ui/fullscreen.png', { frameWidth: 64, frameHeight: 64 });
    },

    create: function ()
    {
        this.add.image(400, 300, 'sky');

        var platforms = this.physics.add.staticGroup();

        platforms.create(400, 568, 'ground').setScale(2).refreshBody();

        // platforms.create(600, 400, 'ground');
        // platforms.create(100, 250, 'ground');
        // platforms.create(750, 220, 'ground');
        this.platforms = platforms;
        var player = this.physics.add.sprite(100, 450, 'dude');

        player.setBounce(0.2);
        player.setCollideWorldBounds(true);
        this.player = player;
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 20,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [ { key: 'dude', frame: 4 } ],
            frameRate: 40
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 20,
            repeat: -1
        });

        this.cursors = this.input.keyboard.createCursorKeys();

        var stars = this.physics.add.group({
            key: 'star',
            repeat: 1,
            allowGravity: true,

            setXY: { x: 12, y: 100, stepX: Phaser.Math.FloatBetween(0.4, 0.8) * 100 }
        });
        this.starCount = 2;
        stars.children.iterate(function (child) {
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

        });
        this.scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

        this.physics.add.collider(player, platforms);
        this.physics.add.collider(stars, platforms);

        this.physics.add.overlap(player, stars, this.collectStar, null, this);

        this.player = player;

        var button = this.add.image(800-16, 16, 'fullscreen', 0).setOrigin(1, 0).setInteractive();

        button.on('pointerup', function () {

            if (this.scale.isFullscreen)
            {
                button.setFrame(0);

                this.scale.stopFullscreen();
            }
            else
            {
                button.setFrame(1);

                this.scale.startFullscreen();
            }

        }, this);
        this.input.on('pointermove', function (pointer) {

            this.player.x = Phaser.Math.Clamp(pointer.x, 0, 800); //second 1 params are boundries



        }, this);
        this.scoreText.setText('v15');

        var FKey = this.input.keyboard.addKey('F');

        FKey.on('down', function () {

            if (this.scale.isFullscreen)
            {
                button.setFrame(0);
                this.scale.stopFullscreen();
            }
            else
            {
                button.setFrame(1);
                this.scale.startFullscreen();
            }

        }, this);
        
        
    },
    createNewItem(){
        ++this.totalStars;
        let { width, height } = this.sys.game.canvas;
        let offset = Phaser.Math.FloatBetween(0, 4);
        let x = width / offset;
        this.star = this.physics.add.sprite(x,100, 'star');
        // {
        //     key: 'star',
        //     setXY: { x, y: 100},
        //     accelerationX: 150, //makes it go left or right automatically
        // }
        let accel = 0;
        if(x < (width / 2)){
            //star spawn on the
            accel = 25;
        }else{
            accel = -25;
        }
        let vel = -50 * this.totalStars;
        let multiplier = this.totalStars > 10? this.totalStars : 1;
        this.star.setAccelerationX(accel * multiplier); 
        this.star.setGravityY(50 * this.totalStars);
        this.star.setVelocityY(-250); //provides upward motion to simulate the flipping of the burger
        this.star.setFrictionY(10);
        this.star.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        // star.setCollideWorldBounds(true);
        // this.star.setGravityY(this.totalStars);
        this.star.update = function(){
            console.log("hello");
        }
        // star..iterate(function (child) {
        //     child.setGravityY(50)
        //     child.setVelocityY(-200); //provides upward motion to simulate the flipping of the burger
        //     child.setFrictionY(10);
        //     child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        //     child.setCollideWorldBounds(true);
        //     child.update = function(){
        //         console.log("hello");
        //     }

        // });
        
        //this will need to have platforms 
        // this.physics.add.collider(this.star, this.platforms);
        this.physics.add.overlap(this.player, this.star, this.collectStar, null, this);
    },
    update: function ()
    {
        if(this.star){
            let { width, height } = this.sys.game.canvas;
            if(this.star.x > width || this.star.y > height){
                this.star.disableBody(true, true);
                this.createNewItem();
            }
        }
        if(this.starCount < 1){
            this.starCount += 1;
            this.createNewItem();
        }
        var cursors = this.cursors;
        var player = this.player;

        if (cursors.left.isDown)
        {
            player.setVelocityX(-320); //speed of the player sprite

            player.anims.play('left', true);
        }
        else if (cursors.right.isDown)
        {
            player.setVelocityX(320);

            player.anims.play('right', true);
        }
        else
        {
            player.setVelocityX(0);

            player.anims.play('turn');
        }

        if (cursors.up.isDown && player.body.touching.down)
        {
            player.setVelocityY(-330);
        }
    },

    collectStar: function (player, star)
    {
        --this.starCount;
        star.disableBody(true, true);

        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);
        console.log(this.starCount);
    }

});

var config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'phaser-example',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 600
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: GameScene
};
var game = new Phaser.Game(config);