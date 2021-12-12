/*
###############################
GameData class:
 -DTO (Data Transfer Object)
 -check if hit bomb/In obstacle
###############################
*/

class GameData {
    constructor(json) {
        this.event = json.event
        this.beatmapEvent = null
        this.noteCut = null
        this.beatmap = null
        this.status = null
        this.time = null
        this.inMap = false
        this.perfomance = null
        this.scene = null
        this.hitBomb = 0
        this.didHitBombBool = false
        this.playing = false
        this.inObstacle = false

        switch (this.event) {
            case 'noteMissed':
                this.noteCut = json.noteCut
                this.perfomance = json.status.perfomance
                this.time = json.time
                break;
            case 'noteFullyCut':
                this.noteCut = json.noteCut
                this.perfomance = json.status.perfomance
                this.time = json.time
                break;
            case 'noteCut':
                this.noteCut = json.noteCut
                this.perfomance = json.status.perfomance
                this.time = json.time
                break;
            case 'noteSpawned':
                this.noteCut = json.noteCut
                this.time = json.time
                break;
            case 'beatmapEvent':
                this.beatmapEvent = json.beatmapEvent
                this.time = json.time
                break;
            case 'songStart':
                this.inMap = true
                this.scene = json.status.game.scene
                this.playing = true
                this.status = json.status
                this.perfomance = json.status.perfomance
                this.time = json.time
                break;
            case 'finished':
                this.inMap = false
                this.playing = false
                this.perfomance = json.status.perfomance
                this.time = json.time
                break;
            case 'failed':
                this.inMap = false
                this.playing = false
                this.time = json.time
                break;
            case 'pause':
                this.playing = false
                this.scene = json.status.game.scene
                this.time = json.time
                break;
            case 'resume':
                this.playing = true
                this.time = json.time
                break;
            case 'hello':
                this.status = json.status
                this.perfomance = json.status.perfomance
                this.time = json.time
                this.scene = json.status.game.scene
                break;
            case 'menu':
                this.inMap = false
                this.status = json.status
                this.time = json.time
                this.scene = json.status.game.scene
                break;
            case 'bombMissed':
                this.noteCut = json.noteCut
                this.perfomance = json.status.perfomance
                this.time = json.time
                break;
            case 'bombCut':
                this.noteCut = json.noteCut
                this.perfomance = json.status.perfomance
                this.time = json.time
                if(this.hitBomb != json.status.perfomance.hitBombs) this.didHitBombBool = true
                break;
            case 'obstacleEnter':
                this.perfomance = json.status.perfomance
                this.inObstacle = true
                this.time = json.time
                break;
            case 'obstacleExit':
                this.perfomance = json.status.perfomance
                this.inObstacle = false
                this.time = json.time
                break;
            case 'scoreChanged':
                this.noteCut = json.noteCut
                this.perfomance = json.status.perfomance
                this.time = json.time
                break;

            default:
                break;
        }
    }
    // Test
    getValueBeatMap() {
        return this.beatmapEvent.value
    }

    didHitBomb() {
        return this.didHitBombBool
    }

    isInObstacle() {
        return this.inObstacle
    }
}

module.exports = GameData