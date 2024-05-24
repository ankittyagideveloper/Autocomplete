const search = document.getElementById("search-input");
const suggestionsList = document.getElementById("suggestions-list");
const searchResult = document.getElementById("search-result");
let selectedIndex = -1;
let data = [];

function debounce(fn, delay) {
  let timerId;
  return function (...arguments) {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      fn.apply(this, arguments);
    }, delay);
  };
}

const handleInput = async (value) => {
  if (value === "") {
    clearSuggestions();
    return;
  }

  if (value !== "") {
    const results = await fetchSuggestions(value);
    clearSuggestions();
    selectedIndex = -1;
    renderSuggestions(results);
  }
};

const fetchSuggestions = async (value) => {
  try {
    const results = await fetch(
      `https://dummyjson.com/products/search?q=${value}`
    );

    const { products } = await results.json();
    data = [...products];
    return products;
  } catch (err) {
    console.error(err);
    return null;
  }
};

const renderSuggestions = (data) => {
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < data?.length; i++) {
    const list = document.createElement("li");
    list.textContent = data[i].title;
    list.dataset.value = data[i].title;
    list.id = data[i].id;
    fragment.append(list);
  }
  suggestionsList.append(fragment);
};

const clearSuggestions = () => {
  suggestionsList.innerHTML = "";
};

const handleAutoComplete = (target) => {
  search.value = target.dataset.value;
  renderSelectedResults(target.id);
  clearSuggestions();
};

const highLightSuggestions = (suggestions) => {
  suggestions.forEach((suggestion, index) => {
    if (index === selectedIndex) {
      console.log(index, selectedIndex);
      suggestion.classList.add("selected");
      suggestion.scrollIntoView({ block: "nearest" });
    } else {
      suggestion.classList.remove("selected");
    }
  });
};

const handleKeyNavigation = (e) => {
  const suggestions = document.querySelectorAll("li");
  if (e.key === "ArrowDown") {
    if (selectedIndex < suggestions.length - 1) {
      selectedIndex++;
      highLightSuggestions(suggestions);
    }
  } else if (e.key === "ArrowUp") {
    if (selectedIndex > 0) {
      selectedIndex--;
      highLightSuggestions(suggestions);
    }
  } else if (e.key === "Enter") {
    handleAutoComplete(suggestions[selectedIndex]);
    let selected = suggestions[selectedIndex].id;
    renderSelectedResults(selected);
  }
};

const renderSelectedResults = (prodId) => {
  const product = data.filter(({ id }) => id === Number(prodId))[0];
  console.log(product);
  searchResult.innerHTML = `
  <div class="product">
      <h2>${product.title}</h2>
      <p>${product.description}</p>
      <p>Price: $${product.price}</p>
      <p>Discount: ${product.discountPercentage}%</p>
      <p>Rating: ${product.rating}</p>
      <p>Stock: ${product.stock}</p>
      <p>Brand: ${product.brand}</p>
      <p>Category: ${product.category}</p>
      <img src="${product.thumbnail}" alt="${product.title}" width="100">
      <img src="${product.images[0]}" alt="${product.title}" width="100">
  </div>
`;
};

search.addEventListener("keydown", handleKeyNavigation);

const optimizedFunction = debounce(handleInput, 300);
suggestionsList.addEventListener("click", (e) => handleAutoComplete(e.target));

search.addEventListener("input", (e) => optimizedFunction(e.target.value));
//search.addEventListener("blur", () => clearSuggestions());
