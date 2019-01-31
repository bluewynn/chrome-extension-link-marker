const dateFormat = (date, fmt = 'yyyy-MM-dd hh:mm') => {
  const o = {
    'M+': date.getMonth() + 1, //月份
    'd+': date.getDate(), //日
    'h+': date.getHours(), //小时
    'm+': date.getMinutes(), //分
    's+': date.getSeconds(), //秒
    'q+': Math.floor((date.getMonth() + 3) / 3), //季度
    S: date.getMilliseconds() //毫秒
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1,
      (date.getFullYear() + '').substr(4 - RegExp.$1.length)
    );
  }
  for (let k in o) {
    if (new RegExp('(' + k + ')').test(fmt))
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length)
      );
  }
  return fmt;
};

let popupEl = null;

const popupRender = () => {
  if (!popupEl) {
    const popupDiv = document.createElement('div');
    const styles = {
      position: 'fixed',
      backgroundColor: 'rgba(193, 193, 193, 0.5)',
      display: 'none',
      color: 'rgb(119, 119, 119)',
      padding: '3px',
      borderRadius: '4px',
      fontSize: '12px'
    };

    Object.keys(styles).forEach(
      styleKey => (popupDiv.style[styleKey] = styles[styleKey])
    );
    popupDiv.id = 'link-marker-read-status';
    popupEl = popupDiv;
  }

  document.body.appendChild(popupEl);
};

const bindClick = links => {
  $('a').click(function() {
    const href = $(this).attr('href');

    if (!href) return;

    const linkIndex = links.findIndex(link => link.url === href);

    if (linkIndex === -1) {
      links.push({ url: href, date: dateFormat(new Date()) });
    } else {
      links[linkIndex].date = dateFormat(new Date());
    }

    chrome.storage.sync.set({ visited_link: JSON.stringify(links) }, () => {});
  });
};

const bindMouseOver = links => {
  $('a').mouseover(function() {
    const href = $(this).attr('href');

    if (!href) return;

    const linkIndex = links.findIndex(link => link.url === href);

    if (linkIndex !== -1) {
      const { x, y } = $(this)
        .get(0)
        .getBoundingClientRect();

      $(popupEl).css({
        top: `${y - $(this).height()}px`,
        left: `${x + $(this).width() + 10}px`
      });
      $(popupEl).html(`readed at ${links[linkIndex].date}`);
      $(popupEl).show();
    }
  });

  $('a').mouseleave(function() {
    $(popupEl).hide();
  });
};

window.onload = () => {
  popupRender();

  chrome.storage.sync.get(['visited_link'], result => {
    const links = result.visited_link ? JSON.parse(result.visited_link) : [];

    bindClick(links);
    bindMouseOver(links);
  });
};
