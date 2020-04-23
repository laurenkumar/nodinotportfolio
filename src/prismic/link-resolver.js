export default function(doc) {
  if (doc.isBroken) {
    return '/not-found';
  }

  if (doc.type === 'blog') {
    return '/blog';
  }

  if (doc.type === 'post') {
    return '/blog/' + doc.uid;
  }

  return '/not-found';
}
