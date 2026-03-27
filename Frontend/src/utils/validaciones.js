import api from "../api/api";

export const validarCUIT = (cuit) => {
  const regex = /^[0-9]{11}$/;
  return regex.test(cuit);
};



const validaciones = {
  validarCUIT

};

export default validaciones;