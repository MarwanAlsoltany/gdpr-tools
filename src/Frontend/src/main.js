/**!
 * @author Marwan Al-Soltany <MarwanAlsoltany@gmail.com>
 * @copyright Marwan Al-Soltany 2020
 * @license MIT
 * @link https://github.com/MarwanAlsoltany/gdpr-tools
 */

import { AbstractCmpHelper, config as abstractConfig } from './classes/AbstractCmpHelper';
import { ConcreteCmpHelper, config as concreteConfig } from './classes/ConcreteCmpHelper';

globalThis.AbstractCmpHelper              = AbstractCmpHelper;
globalThis.AbstractCmpHelperConfigExample = abstractConfig;
globalThis.ConcreteCmpHelper              = ConcreteCmpHelper;
globalThis.AbstractCmpHelperConfigExample = concreteConfig;
