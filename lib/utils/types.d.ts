export declare type PartialRecord<K extends keyof any, T> = {
    [P in K]?: T;
};
export declare type AwaitedRes<T extends (...args: any) => any> = Awaited<ReturnType<T>>;
