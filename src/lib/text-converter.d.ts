export declare class TextConverter {
    static toKebab(value: string): string | object | Error;
    static toKebabSpecial(value: string): string;
    static toPascal(value: string): string | object | Error;
    static uCFirst(value: string): string;
    static lCFirst(value: string): string;
    private static toSnake;
}
