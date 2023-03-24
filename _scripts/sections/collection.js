import BaseSection from './base'
import ProductCard from '../components/product/productCard'

export default class CollectionSection extends BaseSection {
  constructor(container) {
    super(container, 'collection')

    console.log('register collection')
    this.productCards = this.$container.find('[data-product-card]').map((i, el) => new ProductCard(el))
  }

  onUnload() {
    // If productCards need to be destroyed, do it here!!
    console.log('unloading', this.productCards)
  }
}
