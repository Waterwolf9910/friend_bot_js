import _random = require("./random");
let random = new _random(12, 9)

export = {
    array: {
        /**
         * 
         * @param array The array to shuffle
         * @param curIndex an index to return the new position
         * @returns the new position of curIndex
         */
        shuffle: (array: any[], curIndex = 0) => {
            if (array == null) {
                throw new SyntaxError("array cannot be null");
            }

            let newIndex = curIndex;

            let size = array.length;

            while (size > 1) {
                --size;
                let i = random.singleNum(size + 1);
                if (newIndex == size) {
                    newIndex = i;
                } else if (newIndex == i) {
                    newIndex = size;
                }
                
                let temp = array[size];
                array[size] = array[i];
                array[i] = temp;

            }
            return newIndex;
        }
    }
}
