import { Core as TaxiCore } from '@unseenco/taxi'
import { throttle } from 'throttle-debounce'
import 'lazysizes'

import { initialize as initializeBreakpoints } from './core/breakpoints'
import { initialize as initializeAnimations } from './core/animations'
import { pageLinkFocus } from './core/a11y'
import {
  userAgentBodyClass,
  isThemeEditor,
  setViewportHeightProperty,
  targetBlankExternalLinks
} from './core/utils'

// Renderers
import BaseRenderer from './renderers/base'
import IndexRenderer from './renderers/index'
import CollectionRenderer from './renderers/collection'
import ProductRenderer from './renderers/product'
import PageRenderer from './renderers/page'

// Transitions
import PageTransition from './transitions/page'

// Sections
import SectionManager from './core/sectionManager'
import HeaderSection from './sections/header'
import FooterSection from './sections/footer'
import AJAXCartSection from './sections/ajaxCart'

(($) => {
  if (typeof $ === undefined) {
    console.warn('jQuery must be loaded before app.js')
  }

  const $body = $(document.body)
  const TEMPLATE_REGEX = /(^|\s)template-\S+/g;  

  initializeBreakpoints()
  initializeAnimations()

  const sectionManager = new SectionManager()

  sectionManager.register('header', HeaderSection)
  sectionManager.register('footer', FooterSection)
  sectionManager.register('ajax-cart', AJAXCartSection)

  // Get back the instances for use in callbacks
  const header = sectionManager.getSingleInstance('header')
  const footer = sectionManager.getSingleInstance('footer')
  const ajaxCart = sectionManager.getSingleInstance('ajax-cart')  

  // START Taxi
  
  if (isThemeEditor()) {
    $('a').attr('data-taxi-ignore', true) // Prevent highway js from running inside the theme editor
  }

  const taxi = new TaxiCore({
    renderers: {
      default: BaseRenderer,
      index: IndexRenderer,
      collection: CollectionRenderer,
      product: ProductRenderer,
      page: PageRenderer,
      // All of these use the default renderer for now
      password: BaseRenderer,
      blog: BaseRenderer,
      cart: BaseRenderer,
      'list-collections': BaseRenderer,
      search: BaseRenderer
    },
    transitions: {
      default: PageTransition
    }
  })


  // This event is sent before the `onLeave()` method of a transition is run to hide a `data-router-view`
  taxi.on('NAVIGATE_OUT', ({ from, trigger }) => {
    ajaxCart.close()

    for (let [key] of taxi.cache) {
      if (key.split('/').includes('products')) {
        taxi.cache.delete(key)
      }
    }
  })
  
  // This event is sent everytime a `data-taxi-view` is added to the DOM
  taxi.on('NAVIGATE_IN', ({ to, trigger }) => {
    $body.removeClass((i, currentClasses) => {
      return currentClasses.split(' ').map(c => c.match(TEMPLATE_REGEX)).join(' ');
    });

    $body.addClass(() => {
      return to.page.body.classList.value.split(' ').map(c => c.match(TEMPLATE_REGEX)).join(' ');
    });
  })

  // This event is sent everytime the `done()` method is called in the `onEnter()` method of a transition
  taxi.on('NAVIGATE_END', ({ to, from, trigger }) => {
    const view = to.content?.dataset.taxiView

    if (view === 'cart') {
      ajaxCart.open();
    }

    targetBlankExternalLinks();
  })

  // END Taxi

  // a11y
  $('.in-page-link').on('click', e => pageLinkFocus($(e.currentTarget.hash)));
  pageLinkFocus($(window.location.hash));  
  

  // We might not need these at some point?  If we switch to dvh units
  window.addEventListener('resize', throttle(250, setViewportHeightProperty))
  document.addEventListener('scroll', throttle(100, setViewportHeightProperty))  

  setViewportHeightProperty();
  userAgentBodyClass(); 
  targetBlankExternalLinks(); // All external links open in a new tab  

  if (window.history && window.history.scrollRestoration) {
    // Prevents browser from restoring scroll position when hitting the back button
    window.history.scrollRestoration = 'manual';
  }

  $(() => {
    document.body.classList.add('is-loaded')
  })
})(window.jQuery)