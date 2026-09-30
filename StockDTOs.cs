namespace InventoryManagement.API.DTOs;

public class StockAdjustmentDto
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public string? Remarks { get; set; }
}

public class StockAdjustmentResponseDto
{
    public bool IsSuccess { get; set; }
    public string Message { get; set; } = string.Empty;
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int PreviousQuantity { get; set; }
    public int NewQuantity { get; set; }
    public string TransactionType { get; set; } = string.Empty;
}

public class StockTransactionDto
{
    public int TransactionId { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string SKU { get; set; } = string.Empty;
    public string? UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string TransactionType { get; set; } = string.Empty; // "IN" or "OUT"
    public int Quantity { get; set; }
    public DateTime TransactionDate { get; set; }
    public string? Remarks { get; set; }
}
