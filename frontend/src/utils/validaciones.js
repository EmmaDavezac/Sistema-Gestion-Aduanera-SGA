const validarCUIT = (cuit) => {
    if (cuit.length !== 11) return false;
    
    const coeficientes = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
    let sumador = 0;
    
    for (let i = 0; i < 10; i++) {
      sumador += parseInt(cuit[i]) * coeficientes[i];
    }
    
    let resultado = 11 - (sumador % 11);
    if (resultado === 11) resultado = 0;
    if (resultado === 10) resultado = 9;
    
    return resultado === parseInt(cuit[10]);
  };
  export default validarCUIT;