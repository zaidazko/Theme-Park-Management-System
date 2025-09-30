using System;
using System.Collections.Generic;

namespace server.Data.Models;

public partial class Customer
{
    public ulong MyRowId { get; set; }

    public string? Maker { get; set; }
}
