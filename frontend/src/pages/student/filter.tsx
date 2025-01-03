import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import React, { useState } from "react";

// Define a type for categories
type Category = {
  id: string;
  label: string;
};

// Props type for the Filter component
type FilterProps = {
  handleFilterChange: (
    selectedCategories: string[],
    sortByPrice: string
  ) => void;
};

// Define categories as a constant
const categories: Category[] = [
  { id: "nextjs", label: "Next JS" },
  { id: "data science", label: "Data Science" },
  { id: "frontend development", label: "Frontend Development" },
  { id: "Fullstack Development", label: "Fullstack Development" },
  { id: "mern stack development", label: "MERN Stack Development" },
  { id: "backend development", label: "Backend Development" },
  { id: "javascript", label: "Javascript" },
  { id: "python", label: "Python" },
  { id: "docker", label: "Docker" },
  { id: "mongodb", label: "MongoDB" },
  { id: "HTML", label: "HTML" },
];

const Filter: React.FC<FilterProps> = ({ handleFilterChange }) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortByPrice, setSortByPrice] = useState<string>("");

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategories((prevCategories) => {
      const newCategories = prevCategories.includes(categoryId)
        ? prevCategories.filter((id) => id !== categoryId)
        : [...prevCategories, categoryId];

      handleFilterChange(newCategories, sortByPrice);
      return newCategories;
    });
  };

  const selectByPriceHandler = (selectedValue: string) => {
    setSortByPrice(selectedValue); // Update the price sorting state
    handleFilterChange(selectedCategories, selectedValue); // Trigger the parent handler
  };

  return (
    <div className="w-full md:w-[20%]">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-lg md:text-xl">Filter Options</h1>
        <Select value={sortByPrice} onValueChange={selectByPriceHandler}>
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Sort by</SelectLabel>
              <SelectItem value="price">Price: Low to High</SelectItem>
              <SelectItem value="-price">Price: High to Low</SelectItem>
              <SelectItem value="rating">Rating</SelectItem> {/* New option */}
              <SelectItem value="popularity">Popularity</SelectItem>{" "}
              {/* New option */}
              <SelectItem value="-createdAt">Newest</SelectItem> {/* New option */}
              <SelectItem value="title">A-Z</SelectItem> {/* New option */}
              <SelectItem value="-title">Z-A</SelectItem> {/* New option */}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <Separator className="my-4" />
      <div>
        <h1 className="font-semibold mb-2">CATEGORY</h1>
        {categories.map((category) => (
          <div key={category.id} className="flex items-center space-x-2 my-2">
            <Checkbox
              id={category.id}
              onCheckedChange={() => handleCategoryChange(category.id)}
            />
            <Label
              htmlFor={category.id}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {category.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Filter;
