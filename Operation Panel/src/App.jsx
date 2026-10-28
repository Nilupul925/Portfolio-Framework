import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabaseClient.js';

const STORAGE_BUCKET = 'portfolio-images';