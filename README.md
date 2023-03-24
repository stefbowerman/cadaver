# Cadaver

Cadaver is a developer friendly Shopify 1.0 theme with simple defaults and minimal settings.

__Features:__
- Minimal theme settings.
- Minimal JS framework for utilizing Shopify sections.
- Taxi.js + instantpage.js built-in for fast, SPA like browsing experience
- Webpack for bundling SCSS and JS files
- 95+ scoring on all lighthouse speed tests.

### Project Structure
```
├── _js
│   └── Working javascript files.  Bundled by Webpack and exported to /assets directory.
├── _scss
│   └── Working scss files.  Bundled by Webpack and exported to /assets directory.
├── assets
│   └── Javascript, CSS, Font Files, Images, etc..
├── config
│   └── custom Theme Settings
├── layout
│   ├── theme.liquid
│   ├── password.liquid
│   └── optional alternate layouts
├── sections
│   ├── shopify sections
├── snippets
│   └── optional custom code snippets
├── templates
│   ├── 404.liquid
│   ├── article.liquid
│   ├── blog.liquid
│   ├── cart.liquid
│   ├── collection.liquid
│   ├── index.liquid
│   ├── list-collections.liquid
│   ├── page.liquid
│   ├── product.liquid
│   └── search.liquid
```

### NPM Scripts

Start webpack watcher -> `` npm run dev ``
Compile for production -> `` npm run build ``

### JavaScript Core + Components

#### AJAXShopifyCustomerForm
In order for this to function correctly, you must disable spam protection through the online store preferences.  If you don't, the store will redirect to a challenge / captcha page and break the functionality.

###### Usage
```javascript
this.$subscribeForm = $('[data-subscribe-form]', this.$container)

this.form = new AJAXShopifyForm(this.$subscribeForm, {
  onSubmitFail: this.onFormSubmitFail.bind(this),
  onSubscribeSuccess: this.onFormSubscribeSuccess.bind(this),
  onSubscribeFail: this.onFormSubscribeFail.bind(this),
})
```

###### Form Markup
```liquid
  {% form 'customer', novalidate: 'novalidate', data-subscribe-form: true %}
    {%- if form.errors and form.errors.messages['email'] != blank -%}
      <div data-errors>
        {{ form.errors.messages['email'] }}
      </div>
    {%- endif -%}

    {%- if form.posted_successfully? -%}
      <div data-success>
        Thank you for subscribing.
      </div>
    {%- endif -%}                
    
    <label for="{{ input_id }}" class="visually-hidden">Enter Email</label>
    <input
      id="{{ input_id }}"
      type="email"
      name="contact[email]"
      value=""
      placeholder="Email Address"
      aria-required="true"
      required="required"
      autocorrect="off"
      autocapitalize="off"
      autocomplete="email"
      class="form-control"
    />

    <button type="submit">Submit</button>

    <p style="display: none" data-form-message></p>
  {% endform %}
```