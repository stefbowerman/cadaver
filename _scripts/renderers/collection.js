import BaseRenderer from './base'
import CollectionSection from '../sections/collection'

export default class CollectionRenderer extends BaseRenderer {
  onEnter() {
    this.sectionManager.register('collection', CollectionSection)
  }
}
