let posts = [];
let lastId = 0;

exports.getAll = () => posts;

exports.getById = (id) => posts.find(p => p.id == id);

exports.add = ({ title, content, author }) => {
  posts.push({
    id: ++lastId,
    title,
    content,
    author,
    date: new Date().toISOString(),
  });
};

exports.update = (id, data) => {
  const index = posts.findIndex(p => p.id == id);
  if (index !== -1) {
    posts[index] = { ...posts[index], ...data };
  }
};

exports.delete = (id) => {
  posts = posts.filter(p => p.id != id);
};
