export default function(doc) {
  if (doc.isBroken) {
    return '/not-found';
  }

  if (doc.type === 'blog') {
    return '/articles';
  }

  if (doc.type === 'post') {
    return '/articles/' + doc.uid;
  }

  return '/not-found';
}
