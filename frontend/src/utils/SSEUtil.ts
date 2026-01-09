import { ref } from 'vue';

/**
 * SSE消息类型定义
 */
export interface SSEMessage {
    type: string;
    data?: any;
    message_id?: string;
    timestamp?: number;
}

/**
 * SSE客户端配置选项
 */
export interface SSEClientOptions {
    url: string;
    clientId?: string;
    reconnectAttempts?: number;
    reconnectInterval?: number;
    onMessage?: (message: SSEMessage) => void;
    onError?: (error: Event) => void;
    onClose?: () => void;
    onOpen?: () => void;
}

/**
 * 简洁的SSE客户端类
 */
export class SSEClient {
    private eventSource: EventSource | null = null;
    private url: string;
    private clientId: string;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number;
    private reconnectInterval: number;
    private isConnecting: boolean = false;

    // 回调函数
    private onMessageCallback?: (message: SSEMessage) => void;
    private onErrorCallback?: (error: Event) => void;
    private onCloseCallback?: () => void;
    private onOpenCallback?: () => void;

    // 响应式状态
    public isConnected = false;
    public lastError = ref<Event | null>(null);

    constructor(options: SSEClientOptions) {
        this.url = options.url;
        this.clientId = options.clientId || this.generateClientId();
        this.maxReconnectAttempts = options.reconnectAttempts || 5;
        this.reconnectInterval = options.reconnectInterval || 1000;
        console.log(this.clientId);

        // 设置回调
        this.onMessageCallback = options.onMessage;
        this.onErrorCallback = options.onError;
        this.onCloseCallback = options.onClose;
        this.onOpenCallback = options.onOpen;
    }

    /**
     * 生成唯一客户端ID
     */
    private generateClientId(): string {
        return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 建立SSE连接
     */
    connect(): this {
        if (this.isConnecting || this.isConnected) return this;

        this.isConnecting = true;

        try {
            // 确保URL包含客户端ID
            const connectUrl = this.url;

            this.eventSource = new EventSource(connectUrl);

            // 设置事件处理器
            this.eventSource.onmessage = (event) => this.handleMessage(event);
            this.eventSource.onerror = (error) => this.handleError(error);
            this.eventSource.onopen = () => this.handleOpen();
            this.eventSource.addEventListener('close', () => this.handleClose());
        } catch (error) {
            console.error('SSE连接失败:', error);
            this.handleError(error as Event);
            this.isConnecting = false;
        }

        return this;
    }

    /**
     * 断开SSE连接
     */
    disconnect(): void {
        this.isConnected = false;
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
    }

    /**
     * 处理接收到的消息
     */
    private handleMessage(event: MessageEvent): void {
        try {
            let data: SSEMessage;

            if (typeof event.data === 'string') {
                data = JSON.parse(event.data);
            } else {
                data = event.data as SSEMessage;
            }

            // 确保消息格式正确
            data.timestamp = data.timestamp || Date.now();

            // 调用消息回调
            if (this.onMessageCallback) {
                this.onMessageCallback(data);
            }
        } catch (error) {
            console.error('解析SSE消息失败:', error);
        }
    }

    /**
     * 处理连接错误
     */
    private handleError(error: Event): void {
        console.error('SSE连接错误:', error);

        this.lastError.value = error;
        this.isConnected = false;

        // 调用错误回调
        if (this.onErrorCallback) {
            this.onErrorCallback(error);
        }

        // 尝试重连
        this.attemptReconnect();
    }

    /**
     * 处理连接打开
     */
    private handleOpen(): void {
        console.log('SSE连接已建立');
        this.isConnected = true;
        this.isConnecting = false;
        this.reconnectAttempts = 0;

        // 调用打开回调
        if (this.onOpenCallback) {
            this.onOpenCallback();
        }
    }

    /**
     * 处理连接关闭
     */
    private handleClose(): void {
        console.log('SSE连接已关闭');

        this.isConnected = false;
        this.isConnecting = false;

        // 调用关闭回调
        if (this.onCloseCallback) {
            this.onCloseCallback();
        }
    }

    /**
     * 尝试重新连接
     */
    private attemptReconnect(): void {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('达到最大重连次数，停止重连');
            return;
        }

        this.reconnectAttempts++;
        console.log(`尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

        setTimeout(() => {
            this.connect();
        }, this.reconnectInterval * this.reconnectAttempts); // 指数退避
    }

    /**
     * 注册消息处理器
     */
    onMessage(callback: (message: SSEMessage) => void): this {
        this.onMessageCallback = callback;
        return this;
    }

    /**
     * 注册错误处理器
     */
    onError(callback: (error: Event) => void): this {
        this.onErrorCallback = callback;
        return this;
    }

    /**
     * 注册连接打开处理器
     */
    onOpen(callback: () => void): this {
        this.onOpenCallback = callback;
        return this;
    }

    /**
     * 注册连接关闭处理器
     */
    onClose(callback: () => void): this {
        this.onCloseCallback = callback;
        return this;
    }
}

/**
 * 创建SSE客户端的工厂函数
 */
export function createSSEClient(options: SSEClientOptions): SSEClient {
    return new SSEClient(options);
}

/**
 * SSE工具函数集
 */
export const SSEUtil = {
    createClient: createSSEClient
};

// 导出所有必要的类型和类
export default SSEUtil;
// 由于 SSEClient 已经在文件顶部导出，此处重复导出会导致变量重声明错误，故移除该导出
// SSEMessage 已在文件顶部导出，移除重复的导出声明
