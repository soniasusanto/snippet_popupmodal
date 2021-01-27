let wkndOverlay = {

  init: function () {
    const cartItemIds = this.getCartItemIds();
    const cartItems = parseInt(
      document.querySelector('#tr_phase2_ShoppingBg .number-items').innerText
    );

    // trigger the overlay only if there are items in the cart
    if (cartItems > 0) {
      // get imageUrls
      const imageUrls = this.getImageUrls(cartItemIds);

      // get total amount of cart
      const cartTotal = document.querySelector(
        '#tr_phase2_ShoppingBg .subtotal'
      ).innerText;

      let scrolledToTheBottom = false;

      window.addEventListener('scroll', () => {
        let doesOverlayExist = document.getElementById('overlay');
        const scrolled = window.scrollY;

        // subtract height of the window from the entire height of the document
        const scrollableHeight =
          document.documentElement.scrollHeight - window.innerHeight;

        // the bottom 10% of page is calculated as when the user scrolled greater
        // than or equal to 90% of the scrollable height
        if (scrolled >= 0.9 * scrollableHeight && !scrolledToTheBottom) {

          // this prevents overlay from triggering more than once
          if (doesOverlayExist === null) {
            this.createOverlay(cartItems, cartTotal, imageUrls);
	    console.log(this)
          }
          scrolledToTheBottom = true;
        }
        if (scrolled < 0.9 * scrollableHeight) {
          scrolledToTheBottom = false;
        }
      });
    }
  },

  /*
  The image urls at Kohls consist of the item id and color (if applicable)
  and a default url. In order to reconstruct the image url for each item in the
  cart, we would need to retrieve the item ids and respective colors, if
  applicable, of the items.
  */

  getCartItemIds: function () {
    let cartItemIds = [];
    let itemIdString = localStorage.getItem('z1_checkoutProductIdList');
    let startIdx = 0;
    while (itemIdString.length > 7) {
      cartItemIds.push(itemIdString.substr(0, 7));
      itemIdString = itemIdString.substr(startIdx + 10);
    }
    return cartItemIds;
  },

  getImageUrls: function (cartItemIds) {
    let imageUrls = [];

    // retrieve items that are in the cart
    const filterIdAndColor = JSON.parse(
      localStorage.getItem('tceSizeAndColorCarryover')
    ).filter((item) => {
      return cartItemIds.indexOf(item.id) !== -1;
    });

    // retrieve color of item and add to corresponding
    // product id that has a color attribute
    const idAndColor = {};
    filterIdAndColor.forEach((item) => {
      idAndColor[item.id] = item.color;
    });

    cartItemIds.forEach((cartItemId) => {
      if (cartItemId in idAndColor) {
        cartItemId += ' ' + idAndColor[cartItemId];
        cartItemId = cartItemId.split(' ').join('_');
      }
      imageUrls.push(
        `https://media.kohlsimg.com/is/image/kohls/${cartItemId}?wid=180&hei=180&op_sharpen=1`
      );
    });
    return imageUrls;
  },

  /*
  createOverlay() is called in the init() function and creates the entire
  overlay. It also calls other functions that create all of its child
  components.
  */

  createOverlay: function (cartItems, cartTotal, imageUrls) {
    const overlay = document.createElement('div');
    overlay.id = 'overlay';
    const modal = document.createElement('div');
    overlay.appendChild(modal);

    // add styling to overlay and modal
    this.overlayContainerStyle(overlay);
    this.modalContainerStyle(modal);

    // create and append child elements to modal
    this.createModalButtonContainer(modal);
    this.createLogoContainer(modal);
    this.createModalHeaderContainer(modal, cartItems);
    this.createImageContainer(modal, imageUrls, cartItems);
    this.createCartTotalContainer(modal, cartTotal);
    this.createViewCartContainer(modal);

    // append overlay to the website
    document.body.appendChild(overlay);
  },

  /*
  List of methods that will create child components of the overlay and modal
  */

  createModalButtonContainer: function (modal) {
    const modalButtonContainer = document.createElement('div');
    const modalButton = document.createElement('button');
    modalButton.nodeType = 'button';
    const modalButtonText = document.createTextNode('x');
    modalButton.appendChild(modalButtonText);
    modalButtonContainer.appendChild(modalButton);
    modal.appendChild(modalButtonContainer);

    // add styling
    this.modalButtonContainerStyle(modalButtonContainer, modalButton);

    // add event listener for button to close the overlay when clicked
    modalButton.addEventListener('click', (event) => {
      const overlay = document.getElementById('overlay');
      if (overlay !== null) {
        overlay.remove();
      }
    });
  },

  createLogoContainer: function (modal) {
    const xmlns = 'http://www.w3.org/2000/svg';
    const logoContainer = document.createElement('div');
    const svg = document.createElementNS(xmlns, 'svg');
    svg.setAttribute('role', 'img');
    svg.setAttribute('focusable', 'false');
    svg.setAttribute('overflow', 'visible');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('viewBox', '0 0 122 20');
    svg.setAttribute('height', '22');
    svg.setAttribute('width', '147');
    const g = document.createElementNS(xmlns, 'g');
    g.setAttribute('transform', 'translate(1 1)');
    const path = document.createElementNS(xmlns, 'path');
    path.setAttribute(
      'd',
      'M0 .441h8.193v5.483h.063L14.527.441h9.202l-7.563 6.712 8.729 9.234H14.527l-6.27-6.524h-.064v6.524H0V.44zM36.775 0c9.328 0 11.849 1.922 11.849 8.445 0 6.523-2.521 8.446-11.849 8.446-9.328.031-11.88-1.891-11.88-8.446C24.895 1.922 27.447 0 36.775 0zm0 13.613c3.656 0 3.404-4.002 3.404-5.325 0-1.324.031-4.98-3.404-4.98s-3.403 3.656-3.403 4.98c-.032 1.323-.252 5.325 3.403 5.325zM66.303 10.4h-6.05v6.082h-8.415V.536h8.414v5.483h6.05V.536h8.414V16.48h-8.413V10.4zM78.718.536h8.635v12.132s6.87.032 7.784.032c.913 0 1.45-.82 1.45-.82v4.57H78.717V.536zm37.973 5.294c-1.796-1.418-3.309-1.86-4.947-1.89-1.607-.032-3.089.535-3.089 1.48 0 .756 1.103 1.072 4.948 1.86 3.151.661 5.263 2.237 5.263 5.167 0 3.31-5.641 5.2-10.652 5.2-3.53 0-6.24-.63-8.666-1.702v-4.474c1.513 1.544 4.853 2.363 7.437 2.363 1.418 0 2.143-.22 2.143-1.323 0-.694-.882-1.324-3.592-1.797-5.105-.914-6.839-2.363-6.839-4.821 0-3.53 4.475-5.61 9.958-5.61 2.963 0 5.673.095 8.068 1.198V5.83h-.032zM91.796 7.059l.599-1.009c-1.765-.85-2.3-3.056-1.387-4.317.977-1.355 3.656-1.922 5.137.158 1.229 1.764.063 3.277-.473 3.718-.598.41-3.876 1.45-3.876 1.45zm27.637-5.01c0 .598-.473 1.04-1.04 1.04-.599 0-1.04-.473-1.04-1.04 0-.6.473-1.04 1.04-1.04.567 0 1.04.44 1.04 1.04zm-1.954 0c0 .504.378.913.882.913.505 0 .883-.41.883-.914s-.378-.914-.883-.914c-.504.032-.882.41-.882.914zm.662.63h-.158v-1.23h.473c.283 0 .41.127.41.347 0 .22-.158.315-.316.347l.379.536h-.19l-.346-.536h-.252v.536zm.189-.694c.189 0 .378 0 .378-.22 0-.158-.126-.22-.284-.22h-.283v.409h.189v.031z'
    );
    path.setAttribute('vector-effect', 'non-scaling-stroke');
    path.setAttribute('fill', '#444');
    path.setAttribute('fill-rule', 'evenodd');
    path.setAttribute('height', '22');
    g.appendChild(path);
    svg.appendChild(g);
    logoContainer.appendChild(svg);
    modal.appendChild(logoContainer);
  },

  createModalHeaderContainer: function (modal, cartItems) {
    const modalHeaderContainer = document.createElement('div');
    const modalHeader = document.createElement('p');

    // different messages are displayed depending on the number of cart items
    let modalHeaderText;
    if (cartItems === 1) {
      modalHeaderText = document.createTextNode(
        `There is ${cartItems} item in the cart.`
      );
    } else if (cartItems <= 3) {
      modalHeaderText = document.createTextNode(
        `There are ${cartItems} items in the cart.`
      );
    } else {
      modalHeaderText = document.createTextNode(
        'You have several items in the cart.'
      );
    }
    modalHeader.appendChild(modalHeaderText);
    modalHeaderContainer.appendChild(modalHeader);
    modal.appendChild(modalHeaderContainer);

    // add styling
    this.modalHeaderContainerStyle(modalHeader);
  },

  createImageContainer: function (modal, imageUrls, cartItems) {
    const imageContainer = document.createElement('div');
    let seeMoreItems;
    if (cartItems <= 3) {
      this.createImages(imageUrls, imageContainer);
    } else {
      imageUrls = imageUrls.slice(0, 2);
      this.createImages(imageUrls, imageContainer);
      seeMoreItems = document.createElement('p');
      const seeMoreItemsTextNode = document.createTextNode(
        'Click View Cart To See More Items...'
      );
      seeMoreItems.appendChild(seeMoreItemsTextNode);

      // add styling
      this.modalImageContainerStyle(imageContainer, seeMoreItems);
    }

    modal.appendChild(imageContainer);
    modal.appendChild(seeMoreItems);
  },

  createImages: function (imageUrls, imageContainer) {
    imageUrls.forEach((imgUrl) => {
      let image = document.createElement('img');
      image.setAttribute('src', imgUrl);
      image.setAttribute('alt', 'product image');
      imageContainer.appendChild(image);
    });
  },

  createCartTotalContainer: function (modal, cartTotal) {
    const cartTotalContainer = document.createElement('div');
    const cartTotalElement = document.createElement('p');
    const cartTotalText = `Total: ${cartTotal}`;
    const cartTotalTextNode = document.createTextNode(cartTotalText);
    cartTotalElement.appendChild(cartTotalTextNode);
    cartTotalContainer.appendChild(cartTotalElement);
    modal.appendChild(cartTotalContainer);

    // add styling
    this.modalCartTotalContainerStyle(cartTotalElement);
  },

  createViewCartContainer(modal) {
    const viewCartContainer = document.createElement('div');
    const viewCartLink = document.createElement('a');
    viewCartLink.setAttribute('href', '/checkout/shopping_cart.jsp');
    const viewCartText = document.createElement('span');
    const viewCartTextNode = document.createTextNode('View Cart');
    viewCartText.appendChild(viewCartTextNode);
    viewCartLink.appendChild(viewCartText);
    viewCartContainer.appendChild(viewCartLink);
    modal.appendChild(viewCartContainer);

    // add styling
    this.modalViewCartContainerStyle(viewCartLink);
  },

  /*
  This section includes methods that add styling to individual elements
  */

  overlayContainerStyle: function (overlay) {
    overlay.style.cssText =
      'display:flex;position:fixed;top:0;right:0;left:0;z-index:2147483647;text-align:center;background-color:rgba(0, 0, 0, 0.450);height:100%;font-family:helvetica,arial,sans-serif;';
  },

  modalContainerStyle: function (modal) {
    modal.style.cssText =
      'display:flex;justify-content: space-between;flex-direction: column;align-self: center;margin: 0 auto;width: 550px;height: 350px;padding: 25px;border:5px solid #030303;background-color: #FFFFFF;';
  },

  modalButtonContainerStyle: function (container, button) {
    container.style.cssText = 'display:flex;justify-content:flex-end;';
    button.style.cssText =
      'border:none;background-color:transparent;opacity:0.5;font-size:20px;align-items:center;padding:0;font-weight:200;outline:none';
    this.addHoverEffect(button);
  },

  modalHeaderContainerStyle: function (text) {
    text.style.cssText =
      'font-size:20px;font-weight:900;color:#15718a;margin-bottom:0';
  },

  modalCartTotalContainerStyle: function (cartTotal) {
    cartTotal.style.cssText =
      'font-size:20px;margin-top:10px;margin-bottom:10px';
  },

  modalImageContainerStyle: function (imageContainer, text) {
    imageContainer.style.cssText = 'display:flex;justify-content:center';
    text.style.cssText = 'font-size:15px;font-weight:900;align-self:center';
  },

  modalViewCartContainerStyle: function (link) {
    link.style.cssText =
      'border:1px solid;padding: 10px 15px 10px 15px;margin-top:10px;text-decoration:none;line-height:30px;font-size:20px;color:#ffffff;background-color:#000000;font-family:Helvetica, Arial, sans-serif;';
    this.addHoverEffect(link);
  },

  addHoverEffect: function (element) {
    element.addEventListener('mouseover', (event) => {
      event.target.style.fontWeight = '900';
      setTimeout(function () {
        event.target.style.fontWeight = '200';
      }, 800);
    });
  },
};

wkndOverlay.init();

