const validarCUIT = (cuit) => {

  const regex = /^[0-9]{11}$/;
  return regex.test(cuit);
};

export default validarCUIT;