import db from '../models/index.cjs';
import cloudinary from '../config/cloudinary.js';
import { getPublicIdFromUrl } from '../utils/utils.js';


export const getAllColors = async (page = 1, limit = 10) => {
  try {
    const offset = (page - 1) * limit;
    const { rows: colors, count: totalItems } = await db.Color.findAndCountAll({
      limit,
      offset,
    });

    return {
      colors: colors.map(color => color.get({ plain: true })),
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    };
  } catch (error) {
    throw error;
  }
};

export const getColorById = async (id) => {
  try {
    const color = await db.Color.findByPk(id);

    if (!color) throw new Error('Color not found');
    
    // Convert Sequelize instance to plain JS object
    const plainColor = color.get({ plain: true });
    
    return plainColor;
  } catch (error) {
    throw error;
  }
};


// Create a new color
export async function createColor(data) {

  try{

    const newColor = await db.Color.create(data);
    return newColor.get({plain:true});
  }catch (error){

  };
}

export const updateColor = async (colorId, colorData) => {
  let {
    name,
    hex_code,
    image_url
  } = colorData;

 
  const transactionOptions = {
      retry: {
        max: 5, // Number of retries before throwing an error
        match: [
          'SQLITE_BUSY' // Retry only if database is locked
        ],
        backoffBase: 1000, // Initial retry delay
        backoffExponent: 1.1 // Exponential backoff for retry delays
      }
    };
  
    const transaction = await db.sequelize.transaction(transactionOptions);
  
  
  try {
    // Fetch the color to be updated
    const color = await db.Color.findByPk(colorId);
  
    if (!color) {
      throw new Error('Color not found');
    }

    // Check if new image is uploaded and delete the old one from Cloudinary
    if (image_url && color.image_url) {
      console.log("deleting old image")
      await cloudinary.uploader.destroy(getPublicIdFromUrl(color.image_url, { resource_type: 'image' }));
    }

    if(image_url == ""){
      image_url = color.image_url
    }

    // Update color basic details
    await color.update({ name, hex_code, image_url }, { transaction });

    // Commit the transaction if all operations were successful
    await transaction.commit();

    return color.get({ plain: true });
  
  } catch (error) {
    console.error('Error updating color:', error);
    await transaction.rollback();
    throw error;
  }
};

export const deleteColor= async (id) => {
  try {
      const color = await db.Color.findByPk(id);
      if (!color) return null;
      if(color.image_url){
      await cloudinary.uploader.destroy(getPublicIdFromUrl(color.image_url, { resource_type: 'image' }));

      }
      await color.destroy();
      return true;
  } catch (error) {
      throw error;
  }
};