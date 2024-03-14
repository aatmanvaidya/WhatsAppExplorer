import * as React from 'react';
import { itemData } from './ImageData';
import Image from './Image'

export default function ImageContainer() {
    return (
        <div className='p-5 grid grid-cols-1 Ism:grid-cols-2 Imd:grid-cols-3 Ilg:grid-cols-4 gap-4'>
            {itemData.map((item) => (
                <Image key={item.img} src={item.img} title={item.title} />
            ))}
        </div>
    );
}

