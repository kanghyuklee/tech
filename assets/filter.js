const controls = document.querySelectorAll('[data-filter]');
const posts = document.querySelectorAll('[data-category]');
for (const control of controls) {
  control.addEventListener('click', () => {
    const selected = control.dataset.filter;
    for (const button of controls) button.setAttribute('aria-pressed', String(button.dataset.filter === selected));
    let count = 0;
    for (const post of posts) {
      post.hidden = selected !== 'all' && post.dataset.category !== selected;
      if (!post.hidden) count++;
    }
    document.querySelector('#result-count').textContent = `${count}개의 기록`;
    const empty = document.querySelector('#empty-state');
    empty.hidden = count > 0;
    empty.querySelector('h3').textContent = selected === 'all' ? '첫 번째 노트를 준비하고 있습니다.' : `${selected} 노트를 준비하고 있습니다.`;
  });
}
