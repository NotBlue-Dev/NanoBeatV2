class GameData {
    constructor(json) {
        this.event = json.event
        this.beatmapEvent = null
        this.noteCut = null
        this.beatmap = null
        this.status = null
        this.time = null
        this.perfomance = null

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
                this.playing = true
                this.status = json.status
                this.perfomance = json.status.perfomance
                this.time = json.time
                break;
            case 'finished':
                this.playing = false
                this.perfomance = json.status.perfomance
                this.time = json.time
                break;
            case 'failed':
                this.playing = false
                this.time = json.time
                break;
            case 'pause':
                this.playing = false
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
                break;
            case 'menu':
                this.status = json.status
                this.time = json.time
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

    didHitBomb() {
        return this.didHitBombBool
    }

    isInObstacle() {
        return this.inObstacle
    }
}

module.exports = GameData