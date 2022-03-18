const getIsProduction = () => process.env.NEXT_PUBLIC_ENV === 'production';

export default getIsProduction;
