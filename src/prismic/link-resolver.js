export default function(doc) {
  if (doc.isBroken) {
    return '/not-found';
  }

  if (doc.type === 'blog') {
    return '/blog/' + doc.tags;
  }

  if (doc.type === 'post') {
    return '/blog/' + doc.tags + '/' + doc.uid;
  }

  return '/not-found';
}
