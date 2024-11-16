const BIT_NUMBER_SIZE = BigInt(10); // 10 bit
const SHIFT_SIZE = BigInt(13); // 13 bit
const MAX_BIT_NUMBER = BigInt(1022);
const MAX_SHIFT = BigInt(8191); // 2^13 = 8192

class HighloadQueryId {
    constructor() {
        /**
         * @private
         * @type {bigint} [0 .. 8191]
         */
        this.shift = BigInt(0);
        /**
         * @private
         * @type {bigint} [0 .. 1022]
         */
        this.bitnumber =  BigInt(0);
    }

    /**
     * @param shift {bigint}
     * @param bitnumber {bigint}
     * @return {HighloadQueryId}
     */
    static fromShiftAndBitNumber(shift, bitnumber) {
        const q = new HighloadQueryId();
        q.shift = shift;
        if (q.shift < 0) throw new Error('invalid shift');
        if (q.shift > MAX_SHIFT) throw new Error('invalid shift');
        q.bitnumber = bitnumber;
        if (q.bitnumber < 0) throw new Error('invalid bitnumber');
        if (q.bitnumber > MAX_BIT_NUMBER) throw new Error('invalid bitnumber');
        return q;
    }

    getNext() {
        let newBitnumber = this.bitnumber + BigInt(1);
        let newShift = this.shift;

        if (newShift === MAX_SHIFT && newBitnumber > (MAX_BIT_NUMBER - BigInt(1))) {
            throw new Error('Overload'); // NOTE: we left one queryId for emergency withdraw
        }

        if (newBitnumber > MAX_BIT_NUMBER) {
            newBitnumber = BigInt(0);
            newShift += BigInt(1);
            if (newShift > MAX_SHIFT) {
                throw new Error('Overload')
            }
        }

        return HighloadQueryId.fromShiftAndBitNumber(newShift, newBitnumber);
    }

    hasNext() {
        const isEnd = this.bitnumber >= (MAX_BIT_NUMBER - BigInt(1)) && this.shift === MAX_SHIFT; // NOTE: we left one queryId for emergency withdraw;
        return !isEnd;
    }

    /**
     * @return {bigint}
     */
    getShift() {
        return this.shift;
    }

    /**
     * @return {bigint}
     */
    getBitNumber() {
        return this.bitnumber;
    }

    /**
     * @return {bigint}
     */
    getQueryId() {
        return (this.shift << BIT_NUMBER_SIZE) + this.bitnumber;
    }

    /**
     * @param queryId   {bigint}
     * @return {HighloadQueryId}
     */
    static fromQueryId(queryId) {
        const shift = queryId >> BIT_NUMBER_SIZE;
        const bitnumber = queryId & BigInt(1023);
        return this.fromShiftAndBitNumber(shift, bitnumber);
    }

    /**
     * @param i {bigint}
     * @return {HighloadQueryId}
     */
    static fromSeqno(i) {
        const shift = i / BigInt(1023);
        const bitnumber = i % BigInt(1023);
        return this.fromShiftAndBitNumber(shift, bitnumber);
    }

    /**
     * @return {bigint} [0 .. 8380415]
     */
    toSeqno() {
        return this.bitnumber + this.shift * BigInt(1023);
    }
}

module.exports = {HighloadQueryId};
