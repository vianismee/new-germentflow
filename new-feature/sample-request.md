I am going to explain a new feature for R&D (Sample Request). This will change the customer order flow.

The previous flow was:
User Input Customer -> Sales Order -> Work Order -> QC Check -> Update for Delivery

The new flow will be:
Input Customer -> Request Sample (R&D) -> Sales Order -> Work Order

I will be adding the following features:

* **Improvement for WO tracking:** We will add **Start & Finish fields (Manual Entry)**. This means the start of each stage will no longer be automatic.
* **R&D (Request Sample) Feature:** This feature will include a form containing:
    * Sample ID
    * Select Customer (Pull from the customer database)
    * Sample Name (e.g., Poloshirt)
    * Material Requirements (Can input more than 1 item here)
    * Color (Use the same Color Picker as in the Sales Order module)
    * **Process Stages:** There is an improvement here for the Work Order (WO) stages. The WO has **static stages** (processes that are always performed: Cutting & Sewing). Then, there will be **additional processes** that R&D can select via a checklist. The additional processes are:
        * Embroidery
        * DTF Printing
        * Jersey Printing
        * Sublimation
        * DTF Sublimation

    The Work Order will dynamically add the processes based on what R&D checked. For example: If Product A has 'Embroidery' checked, the WO will display the embroidery process. If Product B has 'DTF Printing' and 'DTF Sublimation' checked, the WO will add both of those processes.

Furthermore, the dashboard will display a tracking table similar to the Work Order, which will only contain these statuses: **Draft, On Review, Approved, Revision, Canceled**.

If the sample status is **'Approved'**, the Sales Order (SO) module can pull data from the approved sample (the Sample ID is converted into the SO). Consequently, the SO user only needs to fill in data such as the **Total Order Quantity** and the **Quantity per Size** based on that total (e.g., Total Order: 100, which could be L: 50, XL: 50). There will be input fields for this.

Finally, if a customer has 2 (or more) approved Sample IDs, they can be converted into a **single SO**, with each Sample ID listed as a line item.