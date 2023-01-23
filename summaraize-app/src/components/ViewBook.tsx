import React, { useState } from 'react';

export const ViewBook = () => {
  const [text, setText] = useState('');

  // React.useEffect(() => {
  //   async function fetchData() {
  //     const text = await readTextFile(s3Url);
  //     setText(text);
  //   }
  //   fetchData();
  // }, [s3Url]);

  return (
    <div>
      <pre>{text}</pre>
    </div>
  );
};
