import { AbstractCmpHelper, config as abstractConfig } from './classes/AbstractCmpHelper';
import { ConcreteCmpHelper, config as concreteConfig } from './classes/ConcreteCmpHelper';

globalThis.AbstractCmpHelper              = AbstractCmpHelper;
globalThis.AbstractCmpHelperConfigExample = abstractConfig;
globalThis.ConcreteCmpHelper              = ConcreteCmpHelper;
globalThis.AbstractCmpHelperConfigExample = concreteConfig;
