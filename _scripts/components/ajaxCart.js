import { changeLineItemQuantity } from '../core/cartAPI'

const selectors = {
  body: '[data-body]',
  totalPrice: '[data-total-price]',
  close: '[data-close]',
  item: '[data-item]',
  itemRemove: '[data-item-remove]',
  toggle: '[data-ajax-cart-toggle]'
}

const classes = {
  open: 'is-open',
  empty: 'is-empty',
  bodyCartOpen: 'ajax-cart-open'
}

const namespace = '.ajaxCart'

export const events = {
  CLICK: `click${namespace}`,
  RENDER: `render${namespace}`
}

const $window = $(window)
const $body = $(document.body)

export default class AJAXCart {
  constructor(el) {
    this.isOpen = false
    this.hasBeenRendered = false
    this.requestInProgress = false

    this.callbacks = {
      bodyToggleClick: this.onToggleClick.bind(this),
      bodyCloseClick: this.onCloseClick.bind(this),
      itemRemoveClick: this.onItemRemoveClick.bind(this)
    }      

    this.$el = $(el)
    this.$body = $(selectors.body, this.$el)
    this.$totalPrice = $(selectors.totalPrice, this.$el)

    this.$el.on(events.CLICK, selectors.itemRemove, this.callbacks.itemRemoveClick)
    $body.on(events.CLICK, selectors.toggle, this.callbacks.bodyToggleClick)
    $body.on(events.CLICK, selectors.close, this.callbacks.bodyCloseClick)
  }

  destroy() {
    $body.off(events.CLICK, selectors.toggle, this.callbacks.bodyToggleClick)
    $body.off(events.CLICK, selectors.close, this.callbacks.bodyCloseClick)
  }

  bodyTemplate(cart) {
    let html = ''

    if (cart.items) {
      html = $.map(cart.items, ({ key, quantity, imageV2, product_title, price, variant_options }) => {
        return `
          <div class="ajax-cart__item" data-key="${key}" data-qty="${quantity}" data-item>
            <div class="ajax-cart__item-image">
              <img src="${imageV2.url}" alt="${imageV2.alt}" height="${imageV2.height}" width="${imageV2.width}" />
            </div>
            <div class="ajax-cart__item-info">
              <h4>${product_title}</h4>
              <div>${price}</div>
              ${variant_options.map(option => `
                  <div class="ajax-cart__item-detail">
                    <div>${option.name}:</div>
                    <div>${option.value}</div>
                  </div>
                `).join('')
              }
              ${ quantity > 1 ? `<div>QTY ${quantity}</div>` : '' }
              <a href="#" class="btn" data-item-remove>Remove</a>
            </div>            
          </div>
        `
      }).join('')
    }

    return html
  }

  /**
   * Ensure we are working with a valid number
   *
   * @param {int|string} qty
   * @return {int} - Integer quantity.  Defaults to 1
   */
  validateQty(qty) {
    return (parseFloat(qty) === parseInt(qty)) && !Number.isNaN(qty) ? qty : 1;
  }  

  /**
   * Get data about the cart line item row
   *
   * @param {HTMLElement} target - cart line item or child element
   * @return {obj}
   */
  getItemAttributes(target) {
    const $target = $(target);
    const $el = $target.is(selectors.item) ? $target : $target.parents(selectors.item);

    return {
      $el: $el,
      key: $el.data('key'),
      qty: this.validateQty($el.data('qty'))
    };
  }  

  /**
   * Builds the HTML for the ajax cart and inserts it into the container element
   *
   * @param {object} cart - JSON representation of the cart.  See https://help.shopify.com/themes/development/getting-started/using-ajax-api#get-cart
   * @param {string} slot - specific slot to re-render, otherwise the entire cart will be re-rendered
   * @return this
   */
  render(cart, slot) {
    if (!cart) return

    if (slot === 'body') {
      this.$body.html(this.bodyTemplate(cart))
    }
    else if (slot === 'price') {
      this.$totalPrice.html(cart.total_price)
    }
    else {
      this.$body.html(this.bodyTemplate(cart))
      this.$totalPrice.html(cart.total_price)
    }

    this.$el.toggleClass(classes.empty, cart.item_count === 0);

    $window.trigger($.Event(events.RENDER, { cart }));

    this.hasBeenRendered = true;

    return this;
  }

  toggle() {
    return this.isOpen ? this.close() : this.open();
  }  

  open() {
    if (this.isOpen) return

    this.$el.addClass(classes.open)
    $body.addClass(classes.bodyCartOpen)
    this.isOpen = true
  }

  close() {
    if (!this.isOpen) return

    this.$el.removeClass(classes.open)
    $body.removeClass(classes.bodyCartOpen)
    this.isOpen = false
  }  

  onChangeSuccess(cart) {
    this.render(cart).open()
  }

  onChangeFail() {
    // 
  }

  /**
   * Remove the item from the cart.  Extract this into a separate method if there becomes more ways to delete an item
   *
   * @param {event} e - Click event
   */
  onItemRemoveClick(e) {
    e.preventDefault();

    if (this.requestInProgress) {
      return
    }

    const { key, $el } = this.getItemAttributes(e.target)

    this.requestInProgress = true

    changeLineItemQuantity(key, 0)
      .then((cart) => {
        if (cart.item_count > 0) {
          // We only need to remove the deleted item and re-render the price
          $el.slideUp({
            duration: 400,
            easing: 'easeOutCubic',
            start: () => {
              this.render(cart, 'price');
            },
            done: () => {
              $el.remove();
            }
          })
        }
        else {
          this.render(cart);
        }
      })
      .fail(() => {
        console.warn('something went wrong...');
      })
      .always(() => {
        this.requestInProgress = false
      })
  }

  onToggleClick(e) {
    e.preventDefault()

    // If we haven't rendered the cart yet, don't show it
    if (!this.hasBeenRendered) {
      return
    }

    this.toggle()
  }

  onCloseClick(e) {
    e.preventDefault()
    this.close()
  }
}