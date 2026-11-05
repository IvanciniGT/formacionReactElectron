// Registra tsx para que cucumber pueda importar los .ts. Va primero en «import» de cada
// perfil, y no en NODE_OPTIONS='--import tsx': esa forma de poner variables en un script de
// npm solo funciona en bash, no en cmd ni en PowerShell.
import { register } from "tsx/esm/api";

register();
