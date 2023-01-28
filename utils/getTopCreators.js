import React from 'react';

const getTopCreators = (nfts) => {
  const creators = nfts.reduce((creatorObject, nft) => {
    // > 這樣才不會一直蓋掉之前宣告的變數
    creatorObject[nft.seller] = creatorObject[nft.seller] || [];

    creatorObject[nft.seller].push(nft);
    return creatorObject;
  }, {});

  return Object.entries(creators).map((creator) => {
    const seller = creator[0];
    const sum = creator[1].map((item) => Number(item.price)).reduce((prev, cur) => prev + cur, 0);

    return { seller, sum };
  });
};

export default getTopCreators;

// > creators
// {
//     'A':[{},{}]
//     'B':[{}]
//     'C':[{}]
// }

//>object entries
//[[A,B,C],[[{},{}],[{}],[{}]]]

// > Example Input
// [
//     {price:'2',seller:'A'},
//     {price:'3',seller:'B'},
//     {price:'3',seller:'A'},
//     {price:'1',seller:'C'}
// ]

// > Example Output
// [
//     {price:'5',seller:'A'},
//     {price:'3',seller:'B'},
//     {price:'1',seller:'C'}
// ]
