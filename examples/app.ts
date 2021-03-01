import { View } from 'view-hooks'

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

class VoteView extends View {
  constructor (vote: Vote, container: HTMLElement) {
    super({
      container,
      state: vote,
      hooks: ['press']
    })
  }

  isActive (button: number) {
    return this.state.active === button ? 'active' : ''
  }

  initialize (container: HTMLElement) {
    container.innerHTML = `
      <span class="votes">${this.state.votes}</span>
      <button type="button" class="upvote ${this.isActive(1)}">Upvote</button>
      <button type="button" class="downvote ${this.isActive(-1)}">Downvote</button>
    `
    this.$('.upvote')!.onclick = () => this.state.press(1)
    this.$('.downvote')!.onclick = () => this.state.press(-1)
  }

  update () {
    this.$('.votes')!.textContent = this.state.votes
    this.$('.upvote')!.className = `upvote ${this.isActive(1)}`
    this.$('.downvote')!.className = `downvote ${this.isActive(-1)}`
  }
}

const vote = new Vote(9000)
const container = document.querySelector('.app') as HTMLElement
const view = new VoteView(vote, container)
console.log('view', view)
