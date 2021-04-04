import * as ui from '@lggruspe/ui'

class Vote {
  base: number
  active: number
  constructor (votes: number = 0, active: number = 0) {
    this.base = votes
    this.active = active
  }

  get votes () {
    return this.base + this.active
  }

  press (button: number) {
    this.active = this.active === button ? 0 : button
  }
}

class App implements ui.Component {
  ui: ui.Ui
  vote: Vote
  constructor (vote: Vote) {
    this.vote = vote
    this.ui = new ui.Ui(($: ui.T$) => this.update($))
    this.ui.watch(this.vote, 'press')
  }

  isActive (button: number) {
    return this.vote.active === button ? 'active' : ''
  }

  render () {
    const $ = ui.to$(`
      <div class="app">
        <span class="count">${this.vote.votes}</span>
        <button class="upvote ${this.isActive(1)}">Upvote</button>
        <button class="downvote ${this.isActive(-1)}">Downvote</button>
      </div>
    `)
    $('.upvote').onclick = () => this.vote.press(1)
    $('.downvote').onclick = () => this.vote.press(-1)
    return $()
  }

  update ($: ui.T$) {
    $('.count').textContent = this.vote.votes
    $('.upvote').className = `upvote ${this.isActive(1)}`
    $('.downvote').className = `downvote ${this.isActive(-1)}`
  }
}

ui.render(new App(new Vote(9000)), document.querySelector('.root')!)
