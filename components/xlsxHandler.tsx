import { readFile, set_fs, utils } from 'xlsx';

export async function getStaticXlsx() {
    set_fs(await import("fs"))
    const workSheet = readFile("./public/20221201_T_MONITOR.xlsx")
    console.log(workSheet)
    return workSheet
}