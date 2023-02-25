export const find = (str: string, term: string, startsBy = 0) => {
  if (str === undefined) {
    return -1;
  }
  let len = 0;
  let pos = null;
  for (let i = startsBy; i < str.length; i++) {
    if (str[i] == term[len]) len++;
    else len = 0;
    if (len == term.length) {
      pos = i + 1 - term.length; //gets position i-term.length but has to add 1 given that startsBy has default value 0
      break;
    }
  }
  if (pos != null) return pos;

  return -1;
};

export const getLinkGoogle = (data: any) => {
  if (data === undefined) {
    return null;
  }
  const init = find(data, "https://www.goodreads.com/book/show/");
  const final = find(data, "&", init + 10);
  const linkGoogle = data.slice(init, final);
  return linkGoogle;
};

export const getLinkGoodreads = (data: any) => {
  if (data === undefined) {
    return null;
  }
  const init = find(data, '<img src="https://i.gr-assets.com/images/');
  const final = find(data, '"', init + 10);
  const linkGoodreads = data.slice(init + 10, final);
  return linkGoodreads;
};
