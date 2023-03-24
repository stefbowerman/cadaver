import BaseRenderer from './base'
import CollectionSection from '../sections/collection'

export default class IndexRenderer extends BaseRenderer {
  onEnter() {
    this.sectionManager.register('hero', CollectionSection)
  }
}
