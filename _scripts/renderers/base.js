import { Renderer } from '@unseenco/taxi'
import SectionManager from '../core/sectionManager'

export default class BaseRenderer extends Renderer {
  constructor(properties) {
    super(properties)

    this.sectionManager = new SectionManager()
  }

  onEnter() {
    // run after the new content has been added to the Taxi container
  }

  onEnterCompleted() {
     // run after the transition.onEnter has fully completed
  }

  onLeave() {
    // run before the transition.onLeave method is called
    this.sectionManager.destroy()
  }

  onLeaveCompleted() {
    // run after the transition.onleave has fully completed
  }
}