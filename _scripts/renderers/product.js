import BaseRenderer from './base'
import ProductSection from '../sections/product'

export default class ProductRenderer extends BaseRenderer {
  onEnter() {
    this.sectionManager.register('product', ProductSection)
  }
}