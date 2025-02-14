import { filterOptions } from "@/config";
import { Fragment } from "react";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";

function ProductFilter({ filters, handleFilter }) {
  return (
    <div className="bg-cream-50 rounded-lg border-2 border-cream-200 shadow-sm">
      <div className="p-4 border-b border-cream-200">
        <h2 className="text-lg font-serif font-extrabold text-brown-900">
          Refine Selection
        </h2>
      </div>
      <div className="p-4 space-y-6">
        {Object.keys(filterOptions).map((keyItem) => (
          <Fragment key={keyItem}>
            <div className="space-y-3">
              <h3 className="text-base font-serif font-semibold text-brown-800">
                {keyItem.charAt(0).toUpperCase() + keyItem.slice(1)}
              </h3>
              <div className="grid gap-3">
                {filterOptions[keyItem].map((option) => (
                  <Label 
                    key={option.id} 
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-cream-100 transition-colors cursor-pointer"
                  >
                    <Checkbox
                      checked={
                        filters &&
                        filters[keyItem]?.includes(option.id)
                      }
                      onCheckedChange={() => handleFilter(keyItem, option.id)}
                      className="border-brown-800 data-[state=checked]:bg-brown-800 data-[state=checked]:border-brown-800"
                    />
                    <span className="text-brown-600 font-medium">
                      {option.label}
                    </span>
                  </Label>
                ))}
              </div>
            </div>
            <Separator className="bg-cream-200" />
          </Fragment>
        ))}
      </div>
    </div>
  );
}

export default ProductFilter;
